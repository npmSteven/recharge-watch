import chokidar from "chokidar";
import { QueueItem } from "./types.js";
import { addFile, deleteFile, editFile } from "./file.js";

const cwd = process.cwd();

// not ideal as it is declared globally not reusable
let timeoutId = undefined;
function debounce(delayMS: number, callback: (...props: any) => any) {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(() => {
    callback();
  }, delayMS);
}

let queue: QueueItem[] = [];

function enqueue(item: QueueItem) {
  const queuedItem = queue.find((q) =>
    q.event === item.event && q.path === item.path
  );
  if (!queuedItem) {
    queue.push(item);
  }
}

async function processQueue(queue: QueueItem[]) {
  try {
    for (let [index, queuedItem] of queue.entries()) {
      console.log(`[QUEUE]: Starting ${queuedItem.event}`, queuedItem.path);
      switch (queuedItem.event) {
        case "add": {
          await addFile(queuedItem);
          break;
        }
        case "change": {
          await editFile(queuedItem);
          break;
        }
        case "unlink": {
          await deleteFile(queuedItem);
          break;
        }
      }
      queue.splice(index, 1);
      console.log(`[QUEUE]: Finished ${queuedItem.event}`, queuedItem.path);
    }
  } catch (error) {
    console.error("ERROR - processQueue():", error);
    throw error;
  }
}

function init() {
  console.clear();
  console.log("Watching for files changes");
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
    if (![".js", ".html", ".svg"].find((ext) => path.endsWith(ext))) return;

    // Queue the item
    enqueue({ event, path });

    // Process the queue
    debounce(1000, async () => {
      console.log("processing queue", queue);
      await processQueue(queue);
    });
  });
}

init();
