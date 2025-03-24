import client from "./client.js";
import { DOMParser, Element, parseHTML } from "linkedom";
import fs from "fs/promises";
import config from "./config.js";
import { QueueItem } from "./types.js";

const cwd = process.cwd();

function checkFileExists(file: string) {
  return fs.access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

let files = [];

export async function getFiles(useCache = true) {
  try {
    if (files.length > 0 && useCache) {
      console.log("using cache");
      return files;
    }
    const response = await client.get(`/theme-editor/${config.theme_id}`);
    const { document } = parseHTML(response.data);
    const fetchedFiles = Array.from(
      document.querySelectorAll("[data-asset-id]"),
    ).map(
      (assetEl: Element) => ({
        id: assetEl.getAttribute("data-asset-id"),
        filename: assetEl.textContent.trim(),
      }),
    );
    files = fetchedFiles;
    return fetchedFiles;
  } catch (error) {
    console.error("ERROR - getFiles():", error);
    throw error;
  }
}

export async function addFile(item: QueueItem) {
  try {
    const fileLocation = `${cwd}/${item.path}`;
    const doesFileExist = await checkFileExists(fileLocation);
    if (!doesFileExist) {
      throw new Error("We cannot upload a file that does not exist");
    }
    await client.post(`/portal_theme/${config.theme_id}/assets`, {
      filename: item.path,
    });
    const fetchedFiles = await getFiles(false);
    const foundFile = fetchedFiles.find((f) => f.filename === item.path);
    if (!foundFile) {
      throw new Error("We was unable to find the file on recharge");
    }
    const fileContent = await fs.readFile(fileLocation, "utf-8");
    await client.post(
      `/portal_theme/${config.theme_id}/assets/${foundFile.id}/edit.json`,
      {
        filename: item.path,
        source: fileContent,
      },
    );
  } catch (error) {
    console.error("ERROR - addFile():", error);
    throw error;
  }
}

export async function editFile(item: QueueItem) {
  try {
    const fileLocation = `${cwd}/${item.path}`;
    const doesFileExist = await checkFileExists(fileLocation);
    if (!doesFileExist) {
      throw new Error("We cannot edit a file that does not exist");
    }
    const fetchedFiles = await getFiles();
    const foundFile = fetchedFiles.find((f) => f.filename === item.path);
    if (!foundFile) {
      throw new Error("We was unable to find the file on recharge");
    }
    const fileContent = await fs.readFile(fileLocation, "utf-8");
    console.log({
      filename: item.path,
      source: fileContent,
    });

    await client.post(
      `/portal_theme/${config.theme_id}/assets/${foundFile.id}/edit.json`,
      {
        filename: item.path,
        source: fileContent,
      },
    );
  } catch (error) {
    console.error("ERROR - editFile():", error);
    throw error;
  }
}

export async function deleteFile(item: QueueItem) {
  try {
    const fetchedFiles = await getFiles();
    const foundFile = fetchedFiles.find((f) => f.filename === item.path);
    if (!foundFile) {
      throw new Error("We was unable to find the file on recharge");
    }
    await client.post(
      `/portal_theme/${config.theme_id}/assets/${foundFile.id}/delete`,
    );
    files = [];
  } catch (error) {
    console.error("ERROR - deleteFile():", error);
    throw error;
  }
}
