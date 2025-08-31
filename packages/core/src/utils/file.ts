import path from "path";
import { ISubtitleBlock, ISubtitleFile } from "../types/subtitles.js";
import { readFileContent } from "./file-io.js";
import { parseSrt } from "../parser.js";

export async function loadFileContent(
  file: string,
  outPath: string
): Promise<ISubtitleFile> {
  const fileContent = await readFileContent(file);
  const subtitleBlocks = parseSrt(fileContent);
  return initSubtitleFile(subtitleBlocks, outPath);
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
    fileStats: { blocksTotal: subtitleBlocks.length, blocksShifted: 0 },
  };
  return subtitleFile;
}

export function updateFileName(
  subtitleFile: ISubtitleFile,
  manualName: boolean = false
) {
  if (!subtitleFile.fileDir) {
    throw new Error("File does not have a valid directory");
  }
  if (!subtitleFile.extension) {
    throw new Error("File does not have a valid extension");
  }

  if (!manualName) {
    subtitleFile.fileName = `${subtitleFile.fileName}.shifted`;
  }

  subtitleFile.filePath = path.join(
    subtitleFile.fileDir!,
    `${subtitleFile.fileName}${subtitleFile.extension}`
  );
}
