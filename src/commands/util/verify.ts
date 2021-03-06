import { Message } from "discord.js";
import Command from "structures/Command";
import Bot from "structures/Bot";

export default class VerifyCommand extends Command {
  constructor(bot: Bot) {
    super(bot, {
      name: "verify",
      description: "Verify yourself to get guild access",
      category: "util",
    });
  }

  async execute(message: Message) {
    const lang = await this.bot.utils.getGuildLang(message.guild?.id);

    try {
      const guild = await this.bot.utils.getGuildById(message.guild?.id);
      const member = await this.bot.utils.findMember(message, [message.author.id]);

      if (guild?.verify_data.enabled) {
        const isCorrectChannel = message.channel.id === guild.verify_data.channel_id;

        if (isCorrectChannel) {
          if (!guild.verify_data.role_id) return;

          if (member?.roles.cache.has(guild.verify_data.role_id)) {
            const msg = await message.channel.send({ content: "You are already verified" });

            setTimeout(() => {
              msg.deletable && msg.delete();
            }, 3_000);
          } else {
            member?.roles.add(guild.verify_data.role_id);
            message.react("✅");

            setTimeout(() => {
              message.deletable && message.delete();
            }, 3_000);
          }
        } else {
          message.channel.send({
            content: lang.UTIL.VERIFY_CHANNEL.replace(
              "{channel}",
              `<#${guild.verify_data.channel_id}>`,
            ),
          });
        }
      } else {
        return message.channel.send({ content: lang.UTIL.VERIFY_NOT_ENABLED });
      }
    } catch (err) {
      this.bot.utils.sendErrorLog(err, "error");
      return message.channel.send({ content: lang.GLOBAL.ERROR });
    }
  }
}
