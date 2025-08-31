import chalk from "chalk";

export class Logger {
  static info(message: string) {
    console.log(chalk.blue("[INFO]"), message);
  }
  static success(message: string) {
    console.log(chalk.green("[SUCCESS]"), message);
  }
  static error(message: string) {
    console.error(chalk.red("[ERROR]"), message);
  }
  static warning(message: string) {
    console.warn(chalk.yellow("[WARN]"), message);
  }

  static debug(message: string, verbose = false) {
    if (verbose) console.log(chalk.gray("[DEBUG]"), message);
  }
}
