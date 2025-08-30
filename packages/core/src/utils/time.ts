export function timecodeToMs(timecode: string): number {
  if (timecode.startsWith("-")) {
    throw new Error(
      `Invalid timecode format: ${timecode} | negative timecodes are not supported`
    );
  }
  const parts = timecode.split(":");
  if (
    parts.length !== 3 ||
    !parts[0] ||
    !parts[1] ||
    !parts[2] ||
    !parts[2].includes(",")
  ) {
    throw new Error(
      `Invalid timecode format: ${timecode} | expected format: HH:MM:SS,mmm`
    );
  }
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const secondsParts = parts[2].split(",");
  if (secondsParts.length !== 2 || !secondsParts[0] || !secondsParts[1]) {
    throw new Error(
      `Invalid timecode format: ${timecode} | expected format: HH:MM:SS,mmm`
    );
  }
  const seconds = parseInt(secondsParts[0], 10);
  const milliseconds = parseInt(secondsParts[1].padStart(3, "0"), 10);
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || isNaN(milliseconds)) {
    throw new Error(
      `Invalid timecode format: ${timecode} | expected format: HH:MM:SS,mmm`
    );
  }
  return (
    hoursToMs(hours) +
    minutesToMs(minutes) +
    secondsToMs(seconds) +
    milliseconds
  );
}

export function msToTimecode(ms: number): string {
  if (ms < 0) {
    throw new Error("Negative time values are not supported");
  }
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  const hoursStr = String(hours).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");
  const secondsStr = String(seconds).padStart(2, "0");
  const millisecondsStr = String(milliseconds).padStart(3, "0");
  return `${hoursStr}:${minutesStr}:${secondsStr},${millisecondsStr}`;
}

export function hoursToMs(hours: number): number {
  return hours * 3600000;
}

export function minutesToMs(minutes: number): number {
  return minutes * 60000;
}

export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}
