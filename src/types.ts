import { EventName } from "chokidar/handler.js";

export type QueueItem = {
  event: EventName;
  path: string;
};
