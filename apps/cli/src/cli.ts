import { Command } from "commander";
import { readFileContent } from "@subshift/core";

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
        "❌ You cannot use -r/--indexrange together with -f/--from or -t/--to"
      );
      process.exit(1);
    }
    if (usingFrom !== usingTo) {
      console.error("❌ You must use both -f/--from and -t/--to together");
      process.exit(1);
    }
    const fileContent = await readFileContent(inputFile);
    console.log("File content:", fileContent);
    console.log("Milliseconds to shift:", milliseconds);
    console.log("Options:", options);
  });

program.parse();
