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
