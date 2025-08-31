import { Command } from "commander";
import { formatSrt, shiftSubtitleFile } from "@subshift/core";
import chalk from "chalk";
import {
  collectFiles,
  loadFileContent,
  loadShiftOptions,
  saveSubtitleFile,
  showDiff,
  validateOptions,
} from "./helpers.js";
import { ICLIOptions, ICollectOptions } from "./types/icli.js";
import path from "path";

const program = new Command();

program
  .name("subshift")
  .description("CLI for shifting timecodes in SRT subtitle files")
  .version("1.0.0");

program
  .description("shift timecodes in an subtitle file")
  .argument("<inputs...>", "subtitle file(s) or directories to process")
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
  .option("--outdir <dir>", "Directory to save output files")
  .option("--inplace", "Modify the file in place (overwrites original)")
  .option("--dryrun", "Preview the shifted subtitles without saving")
  .option("--diff", "Show a diff of timecode changes without saving")
  .option("--includehidden", "Include hidden files when processing directories")
  .action(async (inputs: string[], options: ICLIOptions) => {
    validateOptions(options);

    const collectOpts: ICollectOptions = {
      includeHidden: options.includehidden,
    };
    const files = collectFiles(inputs, collectOpts);
    if (files.length === 0) {
      console.error(chalk.red("No subtitle files found to process."));
      process.exit(1);
    }

    for (const file of files) {
      let outPath: string;
      if (options.outdir) {
        outPath = path.join(options.outdir, path.basename(file));
      } else if (options.output) {
        outPath = options.output;
      } else {
        outPath = file;
      }

      try {
        const subtitleFile = await loadFileContent(file, outPath);
        const shiftOptions = loadShiftOptions(options);
        const newSubtitleFile = shiftSubtitleFile(subtitleFile, shiftOptions);
        const newFileString = formatSrt(newSubtitleFile);

        if (options.diff) {
          showDiff(subtitleFile, newSubtitleFile);
          process.exit(0);
        }

        await saveSubtitleFile(newSubtitleFile, newFileString, options);

        console.log(
          chalk.green(`File processed and saved: ${newSubtitleFile.filePath}`)
        );
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
        process.exit(1);
      }
    }
  });

program.parse();
