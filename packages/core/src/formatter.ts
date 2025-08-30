import { ISubtitleBlock, ISubtitleFile } from "./types/subtitles.js";
import { msToTimecode } from "./utils/time.js";

export function formatSrt(subtitleFile: ISubtitleFile): string {
  const formattedBlocks = subtitleFile.blocks.map(formatSubtitleBlock);
  return formattedBlocks.join("\n\n");
}

export function formatSubtitleBlock(block: ISubtitleBlock): string {
  const timecode = `${msToTimecode(block.start)} --> ${msToTimecode(
    block.end
  )}`;
  const text = block.text.join("\n");
  return `${block.index}\n${timecode}\n${text}`;
}
