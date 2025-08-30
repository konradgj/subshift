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
  .command("shift")
  .description("shift timecodes in an subtitle file")
  .argument("<inputFile>", "file to process")
  .argument("<milliseconds>", "time to shift (positive or negative)", parseInt)
  .option(
    "-r, --indexrange <start-end>",
    "range of subtitle indices to shift, e.g., 5-10"
  )
  .option("-f, --from <time>", "start time to shift from, e.g., 00:01:30,500")
  .option("-t, --to <time>", "end time to shift to, e.g., 00:02:00,000")
  .action(async (inputFile, milliseconds, options) => {
    const usingRange = !!options.indexrange;
    const usingFrom = !!options.from;
    const usingTo = !!options.to;

    if (usingRange && (usingFrom || usingTo)) {
      console.error(
        "You cannot use -r/--indexrange together with -f/--from or -t/--to"
      );
      process.exit(1);
    }
    if (usingFrom !== usingTo) {
      console.error("You must use both -f/--from and -t/--to together");
      process.exit(1);
    }

    try {
      const fileContent = await readFileContent(inputFile);
      const subtitleBlocks = parseSrt(fileContent);
      const subtitleFile = initSubtitleFile(subtitleBlocks, inputFile);
      const shiftOptions: IShiftOptions = { ms: milliseconds };

      if (usingRange) {
        const [start, end] = parseIndexRange(options.indexrange);
        shiftOptions.shiftBy = { indexRange: [start, end] } as ShiftByIndex;
      } else if (usingFrom && usingTo) {
        const [from, to] = parseTimeRange(options.from, options.to);
        shiftOptions.shiftBy = { fromTime: from, toTime: to } as ShiftByTime;
      }

      let infoString = `Shifting subtitles in file: ${inputFile} by ${milliseconds} ms`;
      if (usingRange) {
        infoString += ` for indices ${options.indexrange}`;
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
