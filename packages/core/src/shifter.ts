import {
  IShiftOptions,
  ISubtitleBlock,
  ISubtitleFile,
} from "./types/subtitles.js";

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
  const newFile: ISubtitleFile = cloneSubtitleFile(subtitleFile);
  switch (shiftOptions.shiftBy?.type) {
    case "index": {
      const [startIndex, endIndex] = shiftOptions.shiftBy.range;
      newFile.blocks = newFile.blocks.map((block) => {
        if (block.index >= startIndex && block.index <= endIndex) {
          newFile.fileStats.blocksShifted += 1;
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
          newFile.fileStats.blocksShifted += 1;
          return shiftSubtitleBlock(block, shiftOptions.ms);
        }
        return block;
      });
      break;
    }
    default: {
      newFile.blocks = newFile.blocks.map((block) => {
        newFile.fileStats.blocksShifted += 1;
        return shiftSubtitleBlock(block, shiftOptions.ms);
      });
      break;
    }
  }
  return newFile;
}

export function cloneSubtitleBlock(block: ISubtitleBlock): ISubtitleBlock {
  return {
    index: block.index,
    start: block.start,
    end: block.end,
    text: [...block.text], // clone the array so mutations don’t leak
  };
}

export function cloneSubtitleFile(file: ISubtitleFile): ISubtitleFile {
  return {
    ...file,
    blocks: file.blocks.map(cloneSubtitleBlock),
  };
}
