import { describe, expect, test } from "vitest";
import { formatSrt, formatSubtitleBlock, ISubtitleBlock } from "@subshift/core";
import { mockSubtitleBlock, mockSubtitleFile } from "../helper";

describe("formatSrt", () => {
  test("formats multiple subtitle blocks", () => {
    const blocks: ISubtitleBlock[] = [
      mockSubtitleBlock(1, 1000, 2000, ["Hello world"]),
      mockSubtitleBlock(2, 2500, 3000, ["Second line", "third line"]),
    ];
    const subtitleFile = mockSubtitleFile({}, blocks);
    const result = formatSrt(subtitleFile);
    expect(result).toBe(
      "1\n00:00:01,000 --> 00:00:02,000\nHello world\n\n2\n00:00:02,500 --> 00:00:03,000\nSecond line\nthird line"
    );
  });

  test("handles empty blocks array", () => {
    const subtitleFile = mockSubtitleFile({}, []);
    expect(formatSrt(subtitleFile)).toBe("");
  });
});

describe("formatSubtitleBlock", () => {
  test("formats a single subtitle block", () => {
    const blocks = mockSubtitleBlock(1, 1000, 2000, ["Hello world"]);
    const result = formatSubtitleBlock(blocks);
    expect(result).toBe("1\n00:00:01,000 --> 00:00:02,000\nHello world");
  });

  test("handles multi-line text", () => {
    const blocks = mockSubtitleBlock(1, 1000, 2000, [
      "Hello world",
      "This is a test",
    ]);
    const result = formatSubtitleBlock(blocks);
    expect(result).toBe(
      "1\n00:00:01,000 --> 00:00:02,000\nHello world\nThis is a test"
    );
  });
});
