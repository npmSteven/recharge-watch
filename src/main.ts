#!/usr/bin/env node
import chokidar from "chokidar";
import { QueueItem } from "./types.js";
import { addFile, checkFileExists, deleteFile, editFile } from "./file.js";
import config from "./config.js";
import { getCookieStr, getDevelopmentUrl, login } from "./recharge.js";
import client from "./client.js";

console.log('main.ts loaded successfully');

const cwd = config.cwd;

// not ideal as it is declared globally not reusable
let timeoutId: NodeJS.Timeout | undefined = undefined;
function debounce(delayMS: number, callback: () => void): void {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(() => {
    callback();
  }, delayMS);
}

const queue: QueueItem[] = [];

function enqueue(item: QueueItem): void {
  const queuedItem = queue.find((q) =>
    q.event === item.event && q.path === item.path
  );
  if (!queuedItem) {
    queue.push(item);
  }
}

async function processQueue(queue: QueueItem[], chunkSize: number = 10): Promise<void> {
  try {
    await logWatchingChanges();
    // Continue processing until the queue is empty
    while (queue.length > 0) {

      await logWatchingChanges();
      console.log('Syncing', queue.length);
      // Remove a chunk of items from the front of the queue
      const currentChunk = queue.splice(0, chunkSize);
      // Process each item in the chunk concurrently
      await Promise.all(
        currentChunk.map(async queuedItem => {
          switch (queuedItem.event) {
            case "add":
              await addFile(queuedItem);
              break;
            case "change":
              await editFile(queuedItem);
              break;
            case "unlink":
              await deleteFile(queuedItem);
              break;
          }
        })
      );
    }
    await logWatchingChanges();
    console.log('Synced files');
  } catch (error) {
    console.error("ERROR - processQueue():", error.data);
    throw error;
  }
}

async function logWatchingChanges(): Promise<void> {
  console.clear();
  const url = await getDevelopmentUrl();
  console.log("Watching for files changes", cwd);
  console.log("Develop URL:", url);
}

function fetchENVFromArgV(): void {
  for (const arg of process.argv) {
    const [key, value] = arg.split('=');
    if (!key.startsWith('RECHARGE_')) {
      continue;
    }
    config[key.split('RECHARGE_')[1].toLowerCase()] = value;
  }
}

async function init(): Promise<void> {
  try {
    const hasMetaFile = await checkFileExists(`${cwd}/meta.json`);
    if (!hasMetaFile) {
      throw new Error('You cannot sync changes in this repo this is not a valid recharge repo');
    }
    fetchENVFromArgV();
    await login();
    client.defaults.headers.Cookie = await getCookieStr();
    await logWatchingChanges();
    // Watch for changes
    chokidar.watch(cwd, {
      depth: 0,
      followSymlinks: false,
      cwd,
      interval: 100,
      persistent: true,
    }).on("all", (event, path) => {
      // Validate the event type on remove, add, change
      if (!["unlink", "add", "change"].includes(event)) return;
      // Validate flile types
      if (![".js", ".html", ".svg", '.css'].find((ext) => path.endsWith(ext))) return;

      // Queue the item
      enqueue({ event, path });

      // Process the queue
      debounce(1000, async () => {
        await processQueue(queue, 10);
      });
    });
  } catch (error) {
    console.error('ERROR - init():', error);
    process.exit(1);
  }
}

init();
