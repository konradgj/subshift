import {
  formatSrt,
  ISubtitleBlock,
  ISubtitleFile,
  ISubtitleFileStats,
} from "@subshift/core";

export function mockSubtitleBlock(
  index: number = 1,
  start: number = 0,
  end: number = 1000,
  text: string[] = [`Line ${index}`]
): ISubtitleBlock {
  return { index, start, end, text };
}
export function mockSubtitleFile(
  overrides?: Partial<ISubtitleFile>,
  blocks: ISubtitleBlock[] = [
    mockSubtitleBlock(1, 0, 1000),
    mockSubtitleBlock(2, 1500, 2500),
  ]
): ISubtitleFile {
  const fileStats: ISubtitleFileStats = {
    blocksTotal: blocks.length,
    blocksShifted: 0,
  };

  const base: ISubtitleFile = {
    blocks,
    filePath: "/tmp/mock.srt",
    fileDir: "/tmp",
    fileName: "mock",
    extension: ".srt",
    fileStats,
  };
  return { ...base, ...overrides };
}

export function mockSrtString(subtitleFile?: ISubtitleFile): string {
  return formatSrt(mockSubtitleFile(subtitleFile));
}
