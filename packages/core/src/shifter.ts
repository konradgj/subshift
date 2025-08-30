import {
  IShiftOptions,
  ISubtitleBlock,
  ISubtitleFile,
} from "./types/subtitles";

export function shiftSubtitleBlock(
  block: ISubtitleBlock,
  ms: number
): ISubtitleBlock {
  block.start += ms;
  block.end += ms;
  if (block.start < 0) {
    throw new Error("Subtitle start time cannot be negative");
  }
  return block;
}

export function shiftSubtitleFile(
  subtitleFile: ISubtitleFile,
  shiftOptions: IShiftOptions
): ISubtitleFile {
  const newFile: ISubtitleFile = {
    ...subtitleFile,
    blocks: [...subtitleFile.blocks],
  };
  switch (shiftOptions.shiftBy?.type) {
    case "index": {
      const [startIndex, endIndex] = shiftOptions.shiftBy.range;
      newFile.blocks = newFile.blocks.map((block) => {
        if (block.index >= startIndex && block.index <= endIndex) {
          return shiftSubtitleBlock(block, shiftOptions.ms);
        }
        return block;
      });
      break;
    }
    case "time": {
      const { fromTime, toTime } = shiftOptions.shiftBy;
      newFile.blocks = newFile.blocks.map((block) => {
        if (block.start >= fromTime && block.end <= toTime) {
          return shiftSubtitleBlock(block, shiftOptions.ms);
        }
        return block;
      });
      break;
    }
    default: {
      newFile.blocks = newFile.blocks.map((block) =>
        shiftSubtitleBlock(block, shiftOptions.ms)
      );
      break;
    }
  }
  return newFile;
}
