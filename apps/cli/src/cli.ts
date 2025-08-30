import { Command } from "commander";
import {
  formatSrt,
  initSubtitleFile,
  IShiftOptions,
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
  .action(async (file, options) => {
    const usingRange = !!options.range;
    const usingFrom = !!options.from;
    const usingTo = !!options.to;

    if (usingRange && (usingFrom || usingTo)) {
      console.error(
        "You cannot use -r/--range together with -f/--from or -t/--to"
      );
      process.exit(1);
    }
    if (usingFrom !== usingTo) {
      console.error("You must use both -f/--from and -t/--to together");
      process.exit(1);
    }

    try {
      const fileContent = await readFileContent(file);
      const subtitleBlocks = parseSrt(fileContent);
      const subtitleFile = initSubtitleFile(subtitleBlocks, file);
      const shiftOptions: IShiftOptions = { ms: options.shift };

      if (usingRange) {
        const [start, end] = parseIndexRange(options.range);
        shiftOptions.shiftBy = { range: [start, end] } as ShiftByIndex;
      } else if (usingFrom && usingTo) {
        const [from, to] = parseTimeRange(options.from, options.to);
        shiftOptions.shiftBy = { fromTime: from, toTime: to } as ShiftByTime;
      }

      let infoString = `Shifting subtitles in file: ${file} by ${options.shift} ms`;
      if (usingRange) {
        infoString += ` for indices ${options.range}`;
      } else if (usingFrom && usingTo) {
        infoString += ` for time range ${options.from} to ${options.to}`;
      }
      console.log(infoString);

      const newSubtitleFile = shiftSubtitleFile(subtitleFile, shiftOptions);
      updateFileName(newSubtitleFile, `shifted_${subtitleFile.fileName}`);
      const newFileString = formatSrt(newSubtitleFile);

      await writeFileContent(newSubtitleFile.filePath, newFileString);
      console.log(`File processed and saved: ${newSubtitleFile.fileName}`);
    } catch (error) {
      console.error(`Error processing file: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program.parse();
