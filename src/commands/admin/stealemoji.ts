import { Message, Util, Permissions } from "discord.js";
import { parse } from "twemoji-parser";
import Command from "structures/Command";
import Bot from "structures/Bot";

export default class StealEmojiCommand extends Command {
  constructor(bot: Bot) {
    super(bot, {
      name: "stealemoji",
      category: "admin",
      usage: "<emoji> [custom name]",
      description: "Steal an emoji from a different server",
      requiredArgs: [{ name: "emoji" }],
      botPermissions: [Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS],
      memberPermissions: [Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS],
    });
  }

  async execute(message: Message, args: string[]) {
    const lang = await this.bot.utils.getGuildLang(message.guild?.id);
    const [emoji] = args;
    const name = args.slice(1).join(" ");

    try {
      if (emoji.startsWith("https://cdn.discordapp.com")) {
        await message.guild?.emojis.create(emoji, name || lang.ADMIN.GIVE_NAME);

        const embed = this.bot.utils
          .baseEmbed(message)
          .setTitle(lang.ADMIN.EMOJI_ADDED)
          .setDescription(`${lang.ADMIN.EMOJI_ADDED_NAME} ${name || lang.ADMIN.GIVE_NAME}`);

        return message.channel.send({ embeds: [embed] });
      }

      const customEmoji = Util.parseEmoji(emoji);

      if (customEmoji?.id) {
        const link = `https://cdn.discordapp.com/emojis/${customEmoji.id}.${
          customEmoji?.animated ? "gif" : "png"
        }`;

        await message.guild?.emojis.create(`${link}`, `${name || `${customEmoji.name}`}`);
        const embed = this.bot.utils
          .baseEmbed(message)
          .setTitle(lang.ADMIN.EMOJI_ADDED)
          .setDescription(
            `${lang.ADMIN.EMOJI_ADDED_NAME} ${name || customEmoji.name} | ${lang.ADMIN.PREVIEW} [${
              lang.HELP.CLICK_ME
            }](${link})`,
          );

        return message.channel.send({ embeds: [embed] });
      }

      const foundEmoji = parse(emoji, { assetType: "png" });
      if (!foundEmoji[0]) {
        return message.channel.send({
          content: lang.ADMIN.PROVIDE_VALID_EMOJI,
        });
      }

      return message.channel.send({
        content: lang.ADMIN.USE_NORMAL_EMOJI,
      });
    } catch (e) {
      if (String(e).includes("DiscordAPIError: Maximum number of emojis reached")) {
        return message.channel.send({
          content: lang.ADMIN.MAX_EMOJI,
        });
      }

      return message.channel.send({ content: lang.GLOBAL.ERROR });
    }
  }
}
