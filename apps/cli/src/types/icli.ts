export interface ICLIOptions {
  shift: number;
  range?: string;
  from?: string;
  to?: string;
  output?: string;
  inPlace?: boolean;
  dryRun?: boolean;
  diff?: boolean;
}
