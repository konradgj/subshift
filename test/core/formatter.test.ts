import { describe, expect, test } from "vitest";
import { formatSrt, formatSubtitleBlock } from "../../src/core/formatter";
import { ISubtitleBlock, ISubtitleFile } from "../../src/core/types/subtitles";

describe("formatSrt", () => {
  test("formats multiple subtitle blocks", () => {
    const blocks: ISubtitleBlock[] = [
      {
        index: 1,
        start: 1000,
        end: 2000,
        text: ["Hello world"],
      },
      {
        index: 2,
        start: 2500,
        end: 3000,
        text: ["Second line", "third line"],
      },
    ];
    const subtitleFile: ISubtitleFile = { blocks };
    const result = formatSrt(subtitleFile);
    expect(result).toBe(
      "1\n00:00:01,000 --> 00:00:02,000\nHello world\n\n2\n00:00:02,500 --> 00:00:03,000\nSecond line\nthird line"
    );
  });

  test("handles empty blocks array", () => {
    const subtitleFile: ISubtitleFile = { blocks: [] };
    expect(formatSrt(subtitleFile)).toBe("");
  });
});

describe("formatSubtitleBlock", () => {
  test("formats a single subtitle block", () => {
    const blocks: ISubtitleBlock = {
      index: 1,
      start: 1000,
      end: 2000,
      text: ["Hello world"],
    };
    const result = formatSubtitleBlock(blocks);
    expect(result).toBe("1\n00:00:01,000 --> 00:00:02,000\nHello world");
  });

  test("handles multi-line text", () => {
    const blocks: ISubtitleBlock = {
      index: 1,
      start: 1000,
      end: 2000,
      text: ["Hello world", "This is a test"],
    };
    const result = formatSubtitleBlock(blocks);
    expect(result).toBe(
      "1\n00:00:01,000 --> 00:00:02,000\nHello world\nThis is a test"
    );
  });
});
