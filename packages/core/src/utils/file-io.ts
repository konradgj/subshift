import { promises as fs } from "fs";
import { ISubtitleBlock, ISubtitleFile } from "../types/subtitles.js";
import path from "path";

export async function readFileContent(path: string): Promise<string> {
  try {
    return await fs.readFile(path, "utf-8");
  } catch (error) {
    throw new Error(`Failed to read file at ${path}: ${error}`);
  }
}

export async function writeFileContent(path: string, content: string) {
  try {
    await fs.writeFile(path, content, "utf-8");
  } catch (error) {
    throw new Error(`Failed to write file: ${error}`);
  }
}

export function initSubtitleFile(
  subtitleBlocks: ISubtitleBlock[],
  filePath: string
): ISubtitleFile {
  const fullPath = path.resolve(filePath);
  const dir = path.dirname(fullPath);
  const ext = path.extname(fullPath);
  const name = path.basename(fullPath, ext);
  const subtitleFile: ISubtitleFile = {
    blocks: subtitleBlocks,
    filePath: fullPath,
    fileName: name,
    fileDir: dir,
    extension: ext.toLowerCase(),
  };
  return subtitleFile;
}

export function updateFileName(subtitleFile: ISubtitleFile, newName: string) {
  if (!subtitleFile.fileDir || !subtitleFile.extension) {
    throw new Error(
      "File info must be initialized before updating the file name"
    );
  }

  subtitleFile.fileName = newName;
  subtitleFile.filePath = path.join(
    subtitleFile.fileDir!,
    newName + subtitleFile.extension
  );
}
