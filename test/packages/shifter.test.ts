import { beforeEach, describe, expect, test } from "vitest";
import {
  shiftSubtitleBlock,
  shiftSubtitleFile,
} from "../../packages/core/src/shifter";
import {
  ISubtitleBlock,
  ISubtitleFile,
} from "../../packages/core/src/types/subtitles";
import { initSubtitleFile } from "../../packages/core/src/utils/file";

describe("shiftSubtitleBlock", () => {
  test("shifts block by ms", () => {
    const block: ISubtitleBlock = {
      index: 1,
      start: 1000,
      end: 2000,
      text: ["test"],
    };
    const shifted = shiftSubtitleBlock({ ...block }, 500);
    expect(shifted.start).toBe(1500);
    expect(shifted.end).toBe(2500);
  });

  test("throws if start time goes negative", () => {
    const block: ISubtitleBlock = {
      index: 1,
      start: 100,
      end: 200,
      text: ["test"],
    };
    expect(() => shiftSubtitleBlock({ ...block }, -200)).toThrow(
      "Subtitle start time cannot be negative"
    );
  });
});

describe("shiftSubtitleFile", () => {
  const blocks: ISubtitleBlock[] = [
    { index: 1, start: 1000, end: 2000, text: ["A"] },
    { index: 2, start: 3000, end: 4000, text: ["B"] },
    { index: 3, start: 5000, end: 6000, text: ["C"] },
  ];
  let file: ISubtitleFile;

  beforeEach(() => {
    file = initSubtitleFile(
      blocks.map((b) => ({ ...b })),
      "/path/to/test.srt"
    );
  });

  test("shifts all blocks by ms (default)", () => {
    const shifted = shiftSubtitleFile(file, { ms: 1000 });
    expect(shifted.blocks[0].start).toBe(2000);
    expect(shifted.blocks[0].end).toBe(3000);
    expect(shifted.blocks[1].start).toBe(4000);
    expect(shifted.blocks[1].end).toBe(5000);
    expect(shifted.blocks[2].start).toBe(6000);
    expect(shifted.blocks[2].end).toBe(7000);
  });

  test("shifts blocks by index range", () => {
    const shifted = shiftSubtitleFile(file, {
      ms: 500,
      shiftBy: { type: "index", range: [2, 3] },
    });
    expect(shifted.blocks[0].start).toBe(1000);
    expect(shifted.blocks[0].end).toBe(2000);
    expect(shifted.blocks[1].start).toBe(3500);
    expect(shifted.blocks[1].end).toBe(4500);
    expect(shifted.blocks[2].start).toBe(5500);
    expect(shifted.blocks[2].end).toBe(6500);
  });

  test("shifts blocks by time range", () => {
    const shifted = shiftSubtitleFile(file, {
      ms: 250,
      shiftBy: { type: "time", fromTime: 3000, toTime: 6000 },
    });
    expect(shifted.blocks[0].start).toBe(1000);
    expect(shifted.blocks[0].end).toBe(2000);
    expect(shifted.blocks[1].start).toBe(3250);
    expect(shifted.blocks[1].end).toBe(4250);
    expect(shifted.blocks[2].start).toBe(5250);
    expect(shifted.blocks[2].end).toBe(6250);
  });
});
