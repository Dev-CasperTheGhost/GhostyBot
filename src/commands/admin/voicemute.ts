import { Message, Permissions } from "discord.js";
import Command from "structures/Command";
import Bot from "structures/Bot";

export default class VoiceMuteCommand extends Command {
  constructor(bot: Bot) {
    super(bot, {
      name: "voicemute",
      description: "voicemute a user",
      usage: "<user>",
      category: "admin",
      botPermissions: [Permissions.FLAGS.MUTE_MEMBERS],
      memberPermissions: [Permissions.FLAGS.MUTE_MEMBERS],
      requiredArgs: [{ name: "user" }],
    });
  }

  async execute(message: Message, args: string[]) {
    const lang = await this.bot.utils.getGuildLang(message.guild?.id);

    try {
      const muteUser = await this.bot.utils.findMember(message, args);
      const muteReason = args.join(" ").slice(23);

      if (!muteUser) {
        return message.channel.send({
          content: lang.ADMIN.PROVIDE_VALID_MEMBER,
        });
      }

      if (muteUser.voice.serverMute) {
        return message.channel.send({
          content: lang.ADMIN.USER_NOT_VOICE_OR_MUTED,
        });
      }

      muteUser.voice.setMute(true, "muteReason");

      muteUser.user.send({
        content: lang.ADMIN.YOU_MUTED.replace("{guildName}", `${message.guild?.name}`).replace(
          "{reason}",
          muteReason,
        ),
      });

      return message.channel.send({
        content: lang.ADMIN.USER_MUTED.replace("{muteUserTag}", muteUser.user.tag).replace(
          "{reason}",
          muteReason,
        ),
      });
    } catch (err) {
      this.bot.utils.sendErrorLog(err, "error");
      return message.channel.send({ content: lang.GLOBAL.ERROR });
    }
  }
}
