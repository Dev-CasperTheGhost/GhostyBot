import { Message, Permissions } from "discord.js";
import Command from "structures/Command";
import Bot from "structures/Bot";

export default class WarnCommand extends Command {
  constructor(bot: Bot) {
    super(bot, {
      name: "warn",
      description: "Warns a user",
      category: "admin",
      usage: "<user>",
      memberPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      requiredArgs: [{ name: "user" }],
    });
  }

  async execute(message: Message, args: string[]) {
    const lang = await this.bot.utils.getGuildLang(message.guild?.id);
    try {
      const member = await this.bot.utils.findMember(message, args);
      const reason = args.slice(1).join(" ") || lang.GLOBAL.NOT_SPECIFIED;

      if (!member) {
        return message.channel.send({
          content: lang.ADMIN.PROVIDE_VALID_MEMBER,
        });
      }

      if (member.user.bot) {
        return message.channel.send({
          content: lang.MEMBER.BOT_DATA,
        });
      }

      if (member.permissions.has("MANAGE_MESSAGES")) {
        return message.channel.send({
          content: lang.ADMIN.USER_NOT_WARN,
        });
      }

      await this.bot.utils.addWarning(member.user.id, message.guild?.id, reason);

      const warnings = await this.bot.utils.getUserWarnings(member.user.id, message.guild?.id);

      return message.channel.send({
        content: lang.ADMIN.USER_WARNED.replace("{memberTag}", member.user.tag)
          .replace("{reason}", reason)
          .replace("{warningsTotal}", warnings ? `${warnings.length}` : "0"),
      });
    } catch (err) {
      this.bot.utils.sendErrorLog(err, "error");
      return message.channel.send({ content: lang.GLOBAL.ERROR });
    }
  }
}
