import { ISubtitleFile } from "@subshift/core";

export interface ICLIOptions {
  shift: number;
  range?: string;
  from?: string;
  to?: string;
  output?: string;
  outdir?: string;
  inplace?: boolean;
  dryrun?: boolean;
  diff?: boolean;
  includehidden?: boolean;
}

export interface ICollectOptions {
  extentions?: string[];
  includeHidden?: boolean;
}

export interface ISummary {
  totalFiles: number;
  successfulFiles: ISubtitleFile[];
  failedFiles: IFailedFile[];
}

export interface IFailedFile {
  filePath: string;
  error: string;
}
