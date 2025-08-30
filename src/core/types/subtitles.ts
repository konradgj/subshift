export interface ISubtitleBlock {
  index: number;
  start: number; //milliseconds
  end: number; //milliseconds
  text: string[]; //one or more lines
}

export interface IShiftOptions {
  ms: number; //milliseconds to shift, positive or negative
  range?: [number, number]; //optional index range
  fromTime?: number; //optional start time in milliseconds
  toTime?: number; //optional end time in milliseconds
}

export interface ISubtitleFile {
  blocks: ISubtitleBlock[];
  fileName?: string;
  filePath?: string;
  format?: string;
}
