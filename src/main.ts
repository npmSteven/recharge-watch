import chokidar from "chokidar";
import { QueueItem } from "./types.js";
import { addFile, deleteFile, editFile } from "./file.js";
import config from "./config.js";

const cwd = config.cwd;

// not ideal as it is declared globally not reusable
let timeoutId: NodeJS.Timeout | undefined = undefined;
function debounce(delayMS: number, callback: () => void) {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(() => {
    callback();
  }, delayMS);
}

const queue: QueueItem[] = [];

function enqueue(item: QueueItem) {
  const queuedItem = queue.find((q) =>
    q.event === item.event && q.path === item.path
  );
  if (!queuedItem) {
    queue.push(item);
  }
}

async function processQueue(queue: QueueItem[], chunkSize: number = 10) {
  try {
    console.clear();
    console.log("Watching for file changes", cwd);
    // Continue processing until the queue is empty
    while (queue.length > 0) {
      // Remove a chunk of items from the front of the queue
      const currentChunk = queue.splice(0, chunkSize);
      console.log(`[Processing]`, currentChunk.map(q => q.path).join(','))
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
      console.log(`[Finished]`, currentChunk.map(q => q.path).join(','))
    }
  } catch (error) {
    console.error("ERROR - processQueue():", error.data);
    throw error;
  }
}

function init() {
  console.clear();
  console.log("Watching for files changes", cwd);
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
}

init();
