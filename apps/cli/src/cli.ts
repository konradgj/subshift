import { Command } from "commander";
import {
  formatSrt,
  initSubtitleFile,
  IShiftOptions,
  msToTimecode,
  parseIndexRange,
  parseSrt,
  parseTimeRange,
  readFileContent,
  ShiftByIndex,
  ShiftByTime,
  shiftSubtitleFile,
  updateFileName,
  writeFileContent,
} from "@subshift/core";
import chalk from "chalk";

const program = new Command();

program
  .name("subshift")
  .description("CLI for shifting timecodes in SRT subtitle files")
  .version("1.0.0");

program
  .description("shift timecodes in an subtitle file")
  .argument("<file>", "file to process")
  .requiredOption(
    "-s, --shift <ms>",
    "Amount of time to shift (in milliseconds)",
    parseInt
  )
  .option(
    "-r, --range <start-end>",
    "Apply shift only to a subtitle index range (e.g. 5-10)"
  )
  .option(
    "--from <time>",
    "Apply shift starting at this time (e.g. 00:01:23,456)"
  )
  .option("--to <time>", "Apply shift up to this time (e.g. 00:02:00,000)")
  .option("-o, --output <file>", "Path for the output file (default: stdout)")
  .option("--in-place", "Modify the file in place (overwrites original)")
  .option("--dry-run", "Preview the shifted subtitles without saving")
  .option("--diff", "Show a diff of timecode changes without saving")
  .action(async (file, options) => {
    const usingRange = !!options.range;
    const usingFrom = !!options.from;
    const usingTo = !!options.to;
    const usingOutput = !!options.output;
    const usingInPlace = !!options.inPlace;
    const usingDryRun = !!options.dryRun;
    const usingDiff = !!options.diff;

    if (usingRange && (usingFrom || usingTo)) {
      console.error(
        chalk.red(
          "You cannot use -r/--range together with -f/--from or -t/--to"
        )
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

    let filePath: string;
    if (options.output) {
      filePath = options.output;
    } else {
      filePath = file;
    }

    try {
      const fileContent = await readFileContent(file);
      const subtitleBlocks = parseSrt(fileContent);
      const subtitleFile = initSubtitleFile(subtitleBlocks, filePath);
      const shiftOptions: IShiftOptions = { ms: options.shift };

      if (usingRange) {
        const [start, end] = parseIndexRange(options.range);
        shiftOptions.shiftBy = {
          type: "index",
          range: [start, end],
        } as ShiftByIndex;
      } else if (usingFrom && usingTo) {
        const [from, to] = parseTimeRange(options.from, options.to);
        shiftOptions.shiftBy = {
          type: "time",
          fromTime: from,
          toTime: to,
        } as ShiftByTime;
      }

      let infoString = `Shifting subtitles in file: ${filePath} by ${options.shift} ms`;
      if (usingRange) {
        infoString += ` for indices ${options.range}`;
      } else if (usingFrom && usingTo) {
        infoString += ` for time range ${options.from} to ${options.to}`;
      }
      console.log(infoString);

      const newSubtitleFile = shiftSubtitleFile(subtitleFile, shiftOptions);
      if (!usingInPlace) {
        updateFileName(newSubtitleFile, usingOutput);
      }
      const newFileString = formatSrt(newSubtitleFile);

      if (usingDiff) {
        console.log("===== Diff Preview =====");

        subtitleBlocks.forEach((block, index) => {
          const newBlock = newSubtitleFile.blocks[index];
          if (block.start !== newBlock.start || block.end !== newBlock.end) {
            console.log(`Index ${block.index}:`);
            console.log(
              chalk.red(
                ` - ${msToTimecode(block.start)} --> ${msToTimecode(block.end)}`
              )
            );
            console.log(
              chalk.green(
                ` + ${msToTimecode(newBlock.start)} --> ${msToTimecode(
                  newBlock.end
                )}`
              )
            );
          }
        });
        process.exit(0);
      }

      if (usingDryRun) {
        console.log("=== Dry Run Preview ===");
        console.log(newFileString);
        process.exit(0);
      }

      await writeFileContent(newSubtitleFile.filePath, newFileString);
      console.log(
        chalk.green(`File processed and saved: ${newSubtitleFile.filePath}`)
      );
    } catch (error) {
      console.error(
        chalk.red(`Error processing file: ${(error as Error).message}`)
      );
      process.exit(1);
    }
  });

program.parse();
