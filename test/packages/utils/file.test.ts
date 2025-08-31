import { describe, it, expect, afterAll } from "vitest";
import {
  initSubtitleFile,
  loadFileContent,
  updateFileName,
  ISubtitleBlock,
  ISubtitleFile,
  writeFileContent,
} from "@subshift/core";
import { promises as fs } from "fs";
import path from "path";
import {
  mockSrtString,
  mockSubtitleBlock,
  mockSubtitleFile,
} from "../../helper";

describe("loadFileContent", () => {
  const tmpFile = path.join(__dirname, "temp.test.srt");

  it("should load file content correctly", async () => {
    const text = mockSrtString();
    await writeFileContent(tmpFile, text);
    const result = await loadFileContent(tmpFile, tmpFile);

    expect(result.fileStats.blocksShifted).toBe(0);
    expect(result.fileStats.blocksTotal).toBe(2);
    expect(result.filePath).toBe(path.resolve(tmpFile));
    expect(result.fileName).toBe("temp.test");
    expect(result.fileDir).toBe(path.dirname(path.resolve(tmpFile)));
    expect(result.extension).toBe(".srt");
    expect(result.blocks.length).toBe(2);
    expect(result.blocks[0]).toEqual({
      index: 1,
      start: 0,
      end: 1000,
      text: ["Line 1"],
    });
    expect(result.blocks[1]).toEqual({
      index: 2,
      start: 1500,
      end: 2500,
      text: ["Line 2"],
    });
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
    const subtitleFile = mockSubtitleFile();
    updateFileName(subtitleFile);

    expect(subtitleFile.fileName).toBe("mock.shifted");
    expect(subtitleFile.filePath).toBe("/tmp/mock.shifted.srt");
  });

  it("should throw an error if fileDir or extension is missing", () => {
    const subtitleFile = mockSubtitleFile({ fileDir: "", extension: "" });

    expect(() => updateFileName(subtitleFile)).toThrowError(
      "File does not have a valid directory"
    );
    subtitleFile.fileDir = "/path/to/subtitle";
    expect(() => updateFileName(subtitleFile)).toThrowError(
      "File does not have a valid extension"
    );
  });

  it("should correctly handle file path when updating the file name", () => {
    const subtitleFile = mockSubtitleFile();

    updateFileName(subtitleFile);
    expect(subtitleFile.filePath).toBe("/tmp/mock.shifted.srt");
  });
});

describe("initSubtitleFile", () => {
  it("should correctly initialize subtitle file properties", () => {
    const subtitleBlocks: ISubtitleBlock[] = [
      mockSubtitleBlock(1, 0, 1000),
      mockSubtitleBlock(2, 1500, 2500),
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
