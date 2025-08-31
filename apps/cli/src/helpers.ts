import {
  initSubtitleFile,
  IShiftOptions,
  ISubtitleFile,
  msToTimecode,
  parseIndexRange,
  parseSrt,
  parseTimeRange,
  readFileContent,
  ShiftByIndex,
  ShiftByTime,
  updateFileName,
  writeFileContent,
} from "@subshift/core";
import chalk from "chalk";
import { ICLIOptions, ICollectOptions } from "./types/icli";
import fs from "fs";
import path from "path";

export function validateOptions(options: ICLIOptions): void {
  if (options.range && (options.from || options.to)) {
    console.error(
      chalk.red("You cannot use -r/--range together with -f/--from or -t/--to")
    );
    process.exit(1);
  }
  if (!!options.from !== !!options.to) {
    console.error(
      chalk.red("You must use both -f/--from and -t/--to together")
    );
    process.exit(1);
  }
  if (options.inplace && options.output) {
    console.error(
      chalk.red("You cannot use --in-place together with -o/--output")
    );
    process.exit(1);
  }
  if (options.dryrun && options.diff) {
    console.error(chalk.red("You cannot use --dry-run together with --diff"));
    process.exit(1);
  }
  if (options.output && options.outdir) {
    console.error(
      chalk.red("You cannot use -o/--output together with --outdir")
    );
    process.exit(1);
  }
}

export function collectFiles(
  inputs: string[],
  options: ICollectOptions = {}
): string[] {
  const extensions = options.extentions ?? [".srt"];
  const includeHidden = options.includeHidden ?? false;

  return inputs.flatMap((filePath) => {
    return collectFromPath(filePath, extensions, includeHidden);
  });
}

export function collectFromPath(
  filePath: string,
  extensions: string[],
  includeHidden: boolean = false
): string[] {
  const stats = fs.statSync(filePath);

  if (!includeHidden && path.basename(filePath).startsWith(".")) {
    return [];
  }

  if (stats.isFile() && extensions.some((ext) => filePath.endsWith(ext))) {
    return [filePath];
  }
  if (stats.isDirectory()) {
    return fs.readdirSync(filePath).flatMap((name) => {
      return collectFromPath(path.join(filePath, name), extensions);
    });
  }
  return [];
}

export async function loadFileContent(
  file: string,
  outPath: string
): Promise<ISubtitleFile> {
  const fileContent = await readFileContent(file);
  const subtitleBlocks = parseSrt(fileContent);
  return initSubtitleFile(subtitleBlocks, outPath);
}

export function loadShiftOptions(options: ICLIOptions): IShiftOptions {
  const shiftOptions: IShiftOptions = { ms: options.shift };

  if (options.range) {
    const [start, end] = parseIndexRange(options.range);
    shiftOptions.shiftBy = {
      type: "index",
      range: [start, end],
    } as ShiftByIndex;
  } else if (options.from && options.to) {
    const [from, to] = parseTimeRange(options.from, options.to);
    shiftOptions.shiftBy = {
      type: "time",
      fromTime: from,
      toTime: to,
    } as ShiftByTime;
  }
  return shiftOptions;
}

export function showDiff(oldFile: ISubtitleFile, newFile: ISubtitleFile): void {
  console.log(chalk.yellow("===== Diff Preview ====="));

  oldFile.blocks.forEach((block, index) => {
    const newBlock = newFile.blocks[index];
    if (block.start !== newBlock.start || block.end !== newBlock.end) {
      console.log(`Index ${block.index}:`);
      console.log(
        chalk.red(
          ` - ${msToTimecode(block.start)} --> ${msToTimecode(block.end)}`
        )
      );
      console.log(
        chalk.green(
          ` + ${msToTimecode(newBlock.start)} --> ${msToTimecode(newBlock.end)}`
        )
      );
    }
  });
}

export async function saveSubtitleFile(
  file: ISubtitleFile,
  fileString: string,
  options: ICLIOptions
) {
  if (options.dryrun) {
    console.log(chalk.yellow("=== Dry Run Preview ==="));
    console.log(fileString);
    process.exit(0);
  }
  if (!options.inplace) {
    updateFileName(file, !!options.output);
  }
  await writeFileContent(file.filePath, fileString);
}
