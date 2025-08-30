import { describe, expect, test } from "vitest";
import { parseSrt, parseTimecode } from "../../src/core/parser";

const validSrt = `1\n00:00:01,000 --> 00:00:02,000\nHello world\n\n2\n00:00:02,500 --> 00:00:03,000\nSecond line`;
const invalidSrt = `2\n00:00:01,000 --> 00:00:02,000\n\n2\n00:00:02,500 --> 00:00:03,000`;

describe("parseSrt", () => {
  test("parses valid SRT file", () => {
    const result = parseSrt(validSrt);
    expect(result.blocks.length).toBe(2);
    expect(result.blocks[0].index).toBe(1);
    expect(result.blocks[0].start).toBe(1000);
    expect(result.blocks[0].end).toBe(2000);
    expect(result.blocks[0].text).toEqual(["Hello world"]);
    expect(result.blocks[1].index).toBe(2);
    expect(result.blocks[1].start).toBe(2500);
    expect(result.blocks[1].end).toBe(3000);
    expect(result.blocks[1].text).toEqual(["Second line"]);
  });

  test("throws on invalid SRT file", () => {
    expect(() => parseSrt(invalidSrt)).toThrow();
  });

  test("throws on empty input", () => {
    expect(() => parseSrt("")).toThrow("No subtitle entries found");
  });
});

describe("parseTimecode", () => {
  test("parses valid timecode", () => {
    expect(parseTimecode("00:00:01,000 --> 00:00:02,000")).toEqual([
      1000, 2000,
    ]);
    expect(parseTimecode("01:01:01,001 --> 01:01:02,002")).toEqual([
      3661001, 3662002,
    ]);
  });

  test("throws on missing arrow", () => {
    expect(() => parseTimecode("00:00:01,000 00:00:02,000")).toThrow(
      "Invalid timecode format: 00:00:01,000 00:00:02,000"
    );
  });

  test("throws on malformed timecode", () => {
    expect(() => parseTimecode("00:00:01,000 --> invalid")).toThrow(
      "Invalid timecode format: invalid"
    );
    expect(() => parseTimecode("invalid --> 00:00:02,000")).toThrow(
      "Invalid timecode format: invalid"
    );
    expect(() => parseTimecode("invalid --> invalid")).toThrow(
      "Invalid timecode format: invalid"
    );
  });
});
