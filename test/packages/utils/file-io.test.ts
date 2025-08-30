import { describe, it, expect, afterAll, vi } from "vitest";
import {
  initSubtitleFile,
  readFileContent,
  updateFileName,
  writeFileContent,
} from "../../../packages/core/src/utils/file-io";
import { promises as fs } from "fs";
import path from "path";
import {
  ISubtitleBlock,
  ISubtitleFile,
} from "../../../packages/core/src/types/subtitles";

describe("file-io", () => {
  const tmpFile = path.join(__dirname, "temp.test.srt");

  it("writes then reads correctly", async () => {
    const text = "Hello from integration!";
    await writeFileContent(tmpFile, text);

    const read = await readFileContent(tmpFile);
    expect(read).toBe(text);
  });

  it("throws for missing file", async () => {
    await expect(
      readFileContent("definitely-not-there.srt")
    ).rejects.toThrowError(/Failed to read file/);
  });

  it("should throw an error when fs.writeFile rejects", async () => {
    const mockError = new Error("Disk full");
    const mockWrite = vi.spyOn(fs, "writeFile").mockRejectedValue(mockError);
    const filePath = "/path/to/file.srt";
    const content = "Subtitle content";

    await expect(writeFileContent(filePath, content)).rejects.toThrow(
      `Failed to write file: ${mockError}`
    );

    mockWrite.mockRestore();
  });

  afterAll(async () => {
    try {
      await fs.unlink(tmpFile);
    } catch {
      /* empty */
    }
  });
});

describe("updateFileName", () => {
  it("should correctly update the file name and file path", () => {
    const subtitleFile: ISubtitleFile = {
      blocks: [{ index: 1, start: 0, end: 1000, text: ["Subtitle 1"] }],
      filePath: "/path/to/subtitle/file.srt",
      fileName: "file",
      fileDir: "/path/to/subtitle",
      extension: ".srt",
    };
    updateFileName(subtitleFile);

    expect(subtitleFile.fileName).toBe("file.shifted");
    expect(subtitleFile.filePath).toBe("/path/to/subtitle/file.shifted.srt");
  });

  it("should throw an error if fileDir or extension is missing", () => {
    const subtitleFile: ISubtitleFile = {
      blocks: [{ index: 1, start: 0, end: 1000, text: ["Subtitle 1"] }],
      filePath: "/path/to/subtitle/file.srt",
      fileName: "file",
      fileDir: "",
      extension: "",
    };

    expect(() => updateFileName(subtitleFile)).toThrowError(
      "File info must be initialized before updating the file name"
    );
  });

  it("should correctly handle file path when updating the file name", () => {
    const subtitleFile: ISubtitleFile = {
      blocks: [{ index: 1, start: 0, end: 1000, text: ["Subtitle 1"] }],
      filePath: "/path/to/subtitle/file.srt",
      fileName: "file",
      fileDir: "/path/to/subtitle",
      extension: ".srt",
    };

    updateFileName(subtitleFile);
    expect(subtitleFile.filePath).toBe("/path/to/subtitle/file.shifted.srt");
  });
});

describe("initSubtitleFile", () => {
  it("should correctly initialize subtitle file properties", () => {
    const subtitleBlocks: ISubtitleBlock[] = [
      { index: 1, start: 0, end: 1000, text: ["Subtitle 1"] },
      { index: 2, start: 1000, end: 2000, text: ["Subtitle 2"] },
    ];
    const filePath = "/path/to/subtitle/file.srt";
    const result: ISubtitleFile = initSubtitleFile(subtitleBlocks, filePath);

    expect(result.blocks).toEqual(subtitleBlocks);
    expect(result.filePath).toBe(path.resolve(filePath));
    expect(result.fileName).toBe("file");
    expect(result.fileDir).toBe(path.dirname(filePath));
    expect(result.extension).toBe(".srt");
  });

  it("should resolve absolute paths correctly", () => {
    const subtitleBlocks: ISubtitleBlock[] = [];
    const filePath = "relative/path/to/file.srt"; // This should be resolved to an absolute path
    const result: ISubtitleFile = initSubtitleFile(subtitleBlocks, filePath);

    expect(result.filePath).toBe(path.resolve(filePath));
  });
});
