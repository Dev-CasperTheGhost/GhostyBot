import glob from "glob";
import { Collection } from "discord.js";
import Bot from "structures/Bot";
import Command from "structures/Command";
import { resolveFile, validateFile } from "../utils/HandlersUtil";
// import { generateCommandDescriptions } from "../scripts/generateCommandDescriptions";

export default class CommandHandler {
  bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  async loadCommands() {
    try {
      const files = process.env.BUILD_PATH
        ? glob.sync("./dist/src/commands/**/*.js")
        : glob.sync("./src/commands/**/*.ts");

      for (const file of files) {
        await this.loadCommand(file);
      }

      if (process.env["DEV_MODE"] === "true") {
        // import("@scripts/generateCommandDescriptions").then((v) =>
        //   v.generateCommandDescriptions(this.bot.commands.array()),
        // );
        // eslint-disable-next-line promise/catch-or-return
        import("@scripts/generateCommandList").then((v) => v.default(this.bot));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async loadCommand(file: string) {
    delete require.cache[file];

    const command = await resolveFile<Command>(file, this.bot);
    await validateFile(file, command);

    this.bot.commands.set(command.name, command);

    command.options.aliases?.forEach((alias) => {
      this.bot.aliases.set(alias, command.name);
    });

    if (!this.bot.cooldowns.has(command.name)) {
      this.bot.cooldowns.set(command.name, new Collection());
    }

    if (process.env["DEBUG_MODE"] === "true") {
      this.bot.logger.log("COMMAND", `Loaded ${command.name}`);
    }
  }
}
