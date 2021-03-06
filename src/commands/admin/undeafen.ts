import { Message, Permissions } from "discord.js";
import Command from "structures/Command";
import Bot from "structures/Bot";

export default class UnDeafenCommand extends Command {
  constructor(bot: Bot) {
    super(bot, {
      name: "undeafen",
      description: "Undeafen a user from voice channel",
      category: "admin",
      botPermissions: [Permissions.FLAGS.DEAFEN_MEMBERS],
      memberPermissions: [Permissions.FLAGS.DEAFEN_MEMBERS],
    });
  }

  async execute(message: Message, args: string[]) {
    const lang = await this.bot.utils.getGuildLang(message.guild?.id);
    try {
      const undeafenUser = await this.bot.utils.findMember(message, args);

      if (!undeafenUser) {
        return message.channel.send({
          content: lang.ADMIN.PROVIDE_VALID_MEMBER,
        });
      }

      if (!undeafenUser?.voice.serverDeaf) {
        return message.channel.send({
          content: lang.ADMIN.NOT_IN_VOICE_OR_NOT_DEAF,
        });
      }

      undeafenUser.voice.setDeaf(false, "undeafenReason");

      undeafenUser.user.send({
        content: lang.ADMIN.UNDEAFENED_USER.replace("{guildName}", `${message.guild?.name}`),
      });

      return message.channel.send({
        content: lang.ADMIN.UNDEAFENED.replace("{undeafenUserTag}", undeafenUser.user.tag),
      });
    } catch (err) {
      this.bot.utils.sendErrorLog(err, "error");
      return message.channel.send({ content: lang.GLOBAL.ERROR });
    }
  }
}
