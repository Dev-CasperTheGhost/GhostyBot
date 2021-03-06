import { Message, MessageEmbed } from "discord.js";
import { time } from "@discordjs/builders";
import Command from "structures/Command";
import Bot from "structures/Bot";
import paginate from "@/src/utils/paginate";

export default class RemindersCommand extends Command {
  constructor(bot: Bot) {
    super(bot, {
      name: "reminders",
      description: "All your active reminders",
      category: "reminder",
    });
  }

  async execute(message: Message, args: string[]) {
    const lang = await this.bot.utils.getGuildLang(message.guild?.id);
    try {
      const member = await this.bot.utils.findMember(message, args, { allowAuthor: true });

      if (!member) {
        return message.channel.send({ content: lang.ADMIN.PROVIDE_VALID_MEMBER });
      }

      const user = await this.bot.utils.getUserById(member.user.id, message.guild?.id);
      if (!user) return;

      if (!user.reminder.hasReminder === true || user.reminder.reminders?.length <= 0) {
        return message.channel.send({ content: lang.REMINDER.NO_ACTIVE_REM });
      }

      const embeds: MessageEmbed[] = [];

      for (let i = 0; i < user.reminder.reminders.length; i++) {
        if (i % 25 === 0) {
          const mappedReminders = user.reminder.reminders.slice(i, i + 25).map((reminder) => {
            return `**${lang.REMINDER.MESSAGE}** ${reminder.msg}
**${lang.REMINDER.TIME}** ${reminder.time}
**${lang.MEMBER.ID}:** ${reminder.id}
**${lang.REMINDER.ENDS_IN}** ${time(new Date(reminder.ends_at), "R")}`;
          });

          const embed = this.bot.utils
            .baseEmbed(message)
            .setTitle(
              lang.REMINDER.USER_REMINDERS.replace("{memberUsername}", member.user.username),
            )
            .setDescription(mappedReminders.join("\n\n"));

          embeds.push(embed);
        }
      }

      return await paginate(message, embeds);
    } catch (err) {
      this.bot.utils.sendErrorLog(err, "error");
      return message.channel.send({ content: lang.GLOBAL.ERROR });
    }
  }
}
