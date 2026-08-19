// Kolorowe wypisywanie komunikatów serwera na konsolę

import chalk from "chalk";

export const logger = {
  info: (msg: string) => console.log(chalk.blue("ℹ ") + chalk.white(msg)),
  success: (msg: string) =>
    console.log("\n" + chalk.green("✔  ") + chalk.bold.green(msg)),
  error: (msg: string) =>
    console.log("\n" + chalk.red("✖  ") + chalk.bgRed.white.bold(msg)),
  ready: (url: string) => {
    console.log(chalk.cyan("\n🚀 REALTY NEST API IS READY"));
    console.log(chalk.gray("-----------------------------------"));
    console.log(chalk.yellow("🔗 Endpoint: ") + chalk.underline.white(url));
    console.log(chalk.gray("-----------------------------------\n"));
  },
};
