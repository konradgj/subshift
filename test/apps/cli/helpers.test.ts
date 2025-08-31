import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ICLIOptions } from "../../../apps/cli/src/types/icli";
import {
  loadShiftOptions,
  showDiff,
  validateOptions,
} from "../../../apps/cli/src/helpers";
import { IShiftOptions, ISubtitleFile, msToTimecode } from "@subshift/core";

describe("validateOptions", () => {
  let exitMock: ReturnType<typeof vi.spyOn>;
  let consoleMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitMock = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    consoleMock = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    exitMock.mockRestore();
    consoleMock.mockRestore();
  });

  test("throws if range is used with from/to", () => {
    const options: ICLIOptions = {
      shift: 10,
      range: "1-5",
      from: "00:00:01,000",
      to: "00:00:02,000",
    };

    expect(() => validateOptions(options)).toThrow("process.exit called");
    expect(consoleMock).toHaveBeenCalledWith(
      expect.stringContaining("You cannot use -r/--range together")
    );
  });

  test("throws if only from is provided", () => {
    const options: ICLIOptions = { shift: 10, from: "00:00:01,000" };

    expect(() => validateOptions(options)).toThrow("process.exit called");
    expect(consoleMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "You must use both -f/--from and -t/--to together"
      )
    );
  });

  test("throws if inPlace and output are both provided", () => {
    const options: ICLIOptions = {
      shift: 10,
      inPlace: true,
      output: "file.srt",
    };

    expect(() => validateOptions(options)).toThrow("process.exit called");
    expect(consoleMock).toHaveBeenCalledWith(
      expect.stringContaining("You cannot use --in-place together")
    );
  });

  test("throws if dryRun and diff are both provided", () => {
    const options: ICLIOptions = { shift: 10, dryRun: true, diff: true };

    expect(() => validateOptions(options)).toThrow("process.exit called");
    expect(consoleMock).toHaveBeenCalledWith(
      expect.stringContaining("You cannot use --dry-run together")
    );
  });

  test("passes with valid options", () => {
    const options: ICLIOptions = { shift: 10, range: "1-5" };
    expect(() => validateOptions(options)).not.toThrow();
  });
});

describe("loadShiftOptions", () => {
  test("default shift options", () => {
    const options: ICLIOptions = { shift: 5000 };
    const shiftOptions = loadShiftOptions(options);
    expect(shiftOptions).toEqual({ ms: 5000 });
  });

  test("shift options with range", () => {
    const options: ICLIOptions = { shift: 3000, range: "2-4" };
    const shiftOptions = loadShiftOptions(options);
    const expectedOptions: IShiftOptions = {
      ms: 3000,
      shiftBy: {
        type: "index",
        range: [2, 4],
      },
    };
    expect(shiftOptions).toEqual(expectedOptions);
  });

  test("shift options with from/to", () => {
    const options: ICLIOptions = {
      shift: -2000,
      from: "00:01:00,000",
      to: "00:02:00,000",
    };
    const shiftOptions = loadShiftOptions(options);
    const expectedOptions: IShiftOptions = {
      ms: -2000,
      shiftBy: {
        type: "time",
        fromTime: 60000,
        toTime: 120000,
      },
    };
    expect(shiftOptions).toEqual(expectedOptions);
  });
});

describe("showDiff", () => {
  let logSpy: vi.SpyInstance;
  const oldFile: ISubtitleFile = {
    fileName: "old.srt",
    filePath: "/path/old.srt",
    fileDir: "/path",
    extension: "srt",
    blocks: [
      { index: 1, start: 0, end: 1000, text: ["Hello"] },
      { index: 2, start: 1000, end: 2000, text: ["World"] },
    ],
  };

  const newFile: ISubtitleFile = {
    ...oldFile,
    blocks: [
      { index: 1, start: 0, end: 1000, text: ["Hello"] }, // same
      { index: 2, start: 1200, end: 2200, text: ["World"] }, // shifted
    ],
  };

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  test("logs differences between subtitle files", () => {
    showDiff(oldFile, newFile);

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("===== Diff Preview =====")
    );
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Index 2:"));
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `- ${msToTimecode(1000)} --> ${msToTimecode(2000)}`
      )
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `+ ${msToTimecode(1200)} --> ${msToTimecode(2200)}`
      )
    );
  });

  test("does not log unchanged blocks", () => {
    const oldFile1: ISubtitleFile = { ...oldFile };

    showDiff(oldFile, oldFile1);

    // Only the "Diff Preview" header is printed, no index lines
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("===== Diff Preview =====")
    );
  });
});
