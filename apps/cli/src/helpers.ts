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
import { ICLIOptions } from "./types/icli";

export function validateOptions(options: ICLIOptions): void {
  const usingRange = !!options.range;
  const usingFrom = !!options.from;
  const usingTo = !!options.to;
  const usingOutput = !!options.output;
  const usingInPlace = !!options.inPlace;
  const usingDryRun = !!options.dryRun;
  const usingDiff = !!options.diff;

  if (usingRange && (usingFrom || usingTo)) {
    console.error(
      chalk.red("You cannot use -r/--range together with -f/--from or -t/--to")
    );
    process.exit(1);
  }
  if (usingFrom !== usingTo) {
    console.error(
      chalk.red("You must use both -f/--from and -t/--to together")
    );
    process.exit(1);
  }
  if (usingInPlace && usingOutput) {
    console.error(
      chalk.red("You cannot use --in-place together with -o/--output")
    );
    process.exit(1);
  }
  if (usingDryRun && usingDiff) {
    console.error(chalk.red("You cannot use --dry-run together with --diff"));
    process.exit(1);
  }
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
  if (options.dryRun) {
    console.log(chalk.yellow("=== Dry Run Preview ==="));
    console.log(fileString);
    process.exit(0);
  }
  if (!options.inPlace) {
    updateFileName(file, !!options.output);
  }
  await writeFileContent(file.filePath, fileString);
}
