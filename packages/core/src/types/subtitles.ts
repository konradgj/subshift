export interface ISubtitleBlock {
  index: number;
  start: number; //milliseconds
  end: number; //milliseconds
  text: string[]; //one or more lines
}

export interface IShiftOptions {
  ms: number; //milliseconds to shift, positive or negative
  shiftBy?: ShiftByType;
}

export interface ISubtitleFile {
  blocks: ISubtitleBlock[];
  fileName: string;
  filePath: string;
  fileDir: string;
  extension: string;
}

export type ShiftByIndex = {
  type: "index";
  indexRange: [number, number];
};

export type ShiftByTime = {
  type: "time";
  fromTime: number;
  toTime: number;
};

export type ShiftByType = ShiftByIndex | ShiftByTime;
