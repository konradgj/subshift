import { expect, test } from "vitest";
import {
  msToTimecode,
  timecodeToMs,
} from "../../../packages/core/src/utils/time";

// Valid conversions
const validCases: [string, number][] = [
  ["00:00:00,000", 0],
  ["00:00:01,000", 1000],
  ["00:01:00,000", 60000],
  ["01:00:00,000", 3600000],
  ["01:01:01,001", 3661001],
  ["10:10:10,100", 36610100],
  ["00:00:59,999", 59999],
  ["00:59:59,999", 3599999],
];
// Invalid formats
const invalidTimecodes: string[] = [
  "invalid",
  "00:00",
  "00:00:00",
  "00:00:01",
  "00:00:01,000,123",
  "aa:bb:cc,ddd",
];
// Edge cases
const edgeCases: [number, string][] = [
  [0, "00:00:00,000"],
  [36610100, "10:10:10,100"],
];

test("timecode to ms and ms to timecode (valid cases)", () => {
  validCases.forEach(([tc, ms]: [string, number]) => {
    expect(timecodeToMs(tc)).toBe(ms);
    expect(msToTimecode(ms)).toBe(tc);
  });
});

test("round-trip conversion", () => {
  validCases.forEach(([tc]) => {
    expect(msToTimecode(timecodeToMs(tc))).toBe(tc);
  });
});

test("invalid timecode format", () => {
  invalidTimecodes.forEach((tc) => {
    expect(() => timecodeToMs(tc)).toThrow(`Invalid timecode format: ${tc}`);
  });
});

test("negative timecode", () => {
  expect(() => timecodeToMs("-00:00:01,000")).toThrow(
    "Invalid timecode format: -00:00:01,000"
  );
  expect(() => msToTimecode(-1)).toThrow(
    "Negative time values are not supported"
  );
});

test("msToTimecode edge cases", () => {
  edgeCases.forEach(([ms, tc]) => {
    expect(msToTimecode(ms)).toBe(tc);
  });
});
