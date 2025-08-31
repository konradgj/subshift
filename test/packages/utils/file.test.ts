import { describe, it, expect, afterAll } from "vitest";
import {
  initSubtitleFile,
  loadFileContent,
  updateFileName,
} from "../../../packages/core/src/utils/file";
import path from "path";
import {
  ISubtitleBlock,
  ISubtitleFile,
} from "../../../packages/core/src/types/subtitles";
import { writeFileContent } from "../../../packages/core/src/utils/file-io";
import { promises as fs } from "fs";

describe("loadFileContent", () => {
  const tmpFile = path.join(__dirname, "temp.test.srt");

  it("should load file content correctly", async () => {
    const text = `1\n00:00:01,000 --> 00:00:02,000\nHello world\n\n2\n00:00:02,500 --> 00:00:03,000\nSecond line`;
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
      start: 1000,
      end: 2000,
      text: ["Hello world"],
    });
    expect(result.blocks[1]).toEqual({
      index: 2,
      start: 2500,
      end: 3000,
      text: ["Second line"],
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
    const subtitleFile: ISubtitleFile = {
      blocks: [{ index: 1, start: 0, end: 1000, text: ["Subtitle 1"] }],
      filePath: "/path/to/subtitle/file.srt",
      fileName: "file",
      fileDir: "/path/to/subtitle",
      extension: ".srt",
      fileStats: { blocksTotal: 1, blocksShifted: 0 },
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
      fileStats: { blocksTotal: 1, blocksShifted: 0 },
    };

    expect(() => updateFileName(subtitleFile)).toThrowError(
      "File does not have a valid directory"
    );
    subtitleFile.fileDir = "/path/to/subtitle";
    expect(() => updateFileName(subtitleFile)).toThrowError(
      "File does not have a valid extension"
    );
  });

  it("should correctly handle file path when updating the file name", () => {
    const subtitleFile: ISubtitleFile = {
      blocks: [{ index: 1, start: 0, end: 1000, text: ["Subtitle 1"] }],
      filePath: "/path/to/subtitle/file.srt",
      fileName: "file",
      fileDir: "/path/to/subtitle",
      extension: ".srt",
      fileStats: { blocksTotal: 1, blocksShifted: 0 },
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
