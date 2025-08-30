import { ISubtitleBlock } from "./types/subtitles.js";
import { timecodeToMs } from "./utils/time.js";

export function parseSrt(text: string): ISubtitleBlock[] {
  const blocks: ISubtitleBlock[] = [];
  const entries = text.split(/\r?\n\r?\n+/).filter((e) => e.trim() !== "");
  if (entries.length === 0) {
    throw new Error("No subtitle entries found");
  }
  for (const entry of entries) {
    const lines = entry.split(/\r?\n/);
    if (
      lines.length < 3 ||
      lines[0] === undefined ||
      lines[1] === undefined ||
      lines.slice(2).length === 0
    ) {
      throw new Error(`Invalid subtitle entry:\n${entry}`);
    }
    const timecodes = parseTimecode(lines[1]);
    const block: ISubtitleBlock = {
      index: parseInt(lines[0], 10),
      start: timecodes[0],
      end: timecodes[1],
      text: lines.slice(2),
    };
    blocks.push(block);
  }
  return blocks;
}

export function parseTimecode(timecode: string): [number, number] {
  const timeStamps = timecode.split(" --> ");
  if (timeStamps.length !== 2 || !timeStamps[0] || !timeStamps[1]) {
    throw new Error(`Invalid timecode format: ${timecode}`);
  }
  return [timecodeToMs(timeStamps[0]), timecodeToMs(timeStamps[1])];
}

export function parseIndexRange(range: string): [number, number] {
  const [startStr, endStr] = range.split("-");
  const start = parseInt(startStr, 10);
  const end = parseInt(endStr, 10);

  if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
    throw new Error(
      `Invalid index range: ${range} | expected format: <start-end> eg 5-10`
    );
  }
  return [start, end];
}

export function parseTimeRange(start: string, end: string): [number, number] {
  const startMs = timecodeToMs(start);
  const endMs = timecodeToMs(end);
  if (startMs >= endMs) {
    throw new Error(
      `Invalid time range: ${start} - ${end} | start time must be before end time`
    );
  }
  return [startMs, endMs];
}
