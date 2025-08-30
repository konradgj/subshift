import { describe, expect, test } from "vitest";
import {
  parseIndexRange,
  parseSrt,
  parseTimecode,
  parseTimeRange,
} from "../../packages/core/src/parser";

const validSrt = `1\n00:00:01,000 --> 00:00:02,000\nHello world\n\n2\n00:00:02,500 --> 00:00:03,000\nSecond line`;
const invalidSrt = `2\n00:00:01,000 --> 00:00:02,000\n\n2\n00:00:02,500 --> 00:00:03,000`;

describe("parseSrt", () => {
  test("parses valid SRT file", () => {
    const result = parseSrt(validSrt);
    expect(result.length).toBe(2);
    expect(result[0].index).toBe(1);
    expect(result[0].start).toBe(1000);
    expect(result[0].end).toBe(2000);
    expect(result[0].text).toEqual(["Hello world"]);
    expect(result[1].index).toBe(2);
    expect(result[1].start).toBe(2500);
    expect(result[1].end).toBe(3000);
    expect(result[1].text).toEqual(["Second line"]);
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

describe("parseIndexRange", () => {
  test("should parse valid index range correctly", () => {
    const result = parseIndexRange("5-10");
    expect(result).toEqual([5, 10]);
  });

  test("should throw error for invalid index range (non-numeric)", () => {
    expect(() => parseIndexRange("a-b")).toThrowError(
      "Invalid index range: a-b | expected format: <start-end> eg 5-10"
    );
  });

  test("should throw error for invalid index range (start > end)", () => {
    expect(() => parseIndexRange("10-5")).toThrowError(
      "Invalid index range: 10-5 | expected format: <start-end> eg 5-10"
    );
  });

  test("should throw error for invalid index range (missing start)", () => {
    expect(() => parseIndexRange("-10")).toThrowError(
      "Invalid index range: -10 | expected format: <start-end> eg 5-10"
    );
  });

  test("should throw error for invalid index range (missing end)", () => {
    expect(() => parseIndexRange("5-")).toThrowError(
      "Invalid index range: 5- | expected format: <start-end> eg 5-10"
    );
  });
});

describe("parseTimeRange", () => {
  test("should parse valid time range correctly", () => {
    const result = parseTimeRange("00:00:00,000", "00:01:00,000");
    expect(result).toEqual([0, 60000]);
  });

  test("should throw error for invalid time range (start time after end time)", () => {
    expect(() => parseTimeRange("00:01:00,000", "00:00:00,000")).toThrowError(
      "Invalid time range: 00:01:00,000 - 00:00:00,000 | start time must be before end time"
    );
  });

  test("should throw error for invalid time range (start time equal to end time)", () => {
    expect(() => parseTimeRange("00:00:00,000", "00:00:00,000")).toThrowError(
      "Invalid time range: 00:00:00,000 - 00:00:00,000 | start time must be before end time"
    );
  });

  test("should throw error for invalid timecode format (missing milliseconds)", () => {
    expect(() => parseTimeRange("00:00:00", "00:01:00,000")).toThrowError(
      "Invalid timecode format: 00:00:00 | expected format: HH:MM:SS,mmm"
    );
  });

  test("should throw error for invalid timecode format (invalid characters)", () => {
    expect(() => parseTimeRange("invalid", "00:01:00,000")).toThrowError(
      "Invalid timecode format: invalid | expected format: HH:MM:SS,mmm"
    );
  });
});
