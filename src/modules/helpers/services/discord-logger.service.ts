import { Injectable, LoggerService } from '@nestjs/common';
import { Client, TextChannel, GatewayIntentBits } from 'discord.js';

@Injectable()
export class DiscordLoggerService implements LoggerService {
  private discordClient: Client;
  private logChannel: TextChannel;
  private errorChannel: TextChannel;

  constructor() {
    this.discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });
    this.discordClient.login(process.env.DISCORD_API_TOKEN);

    this.discordClient.once('ready', async () => {
      console.log('Discord Logger connected');

      this.logChannel = (await this.discordClient.channels.fetch(
        '<LOG_CHANNEL_ID>',
      )) as TextChannel;
      this.errorChannel = (await this.discordClient.channels.fetch(
        '<ERROR_CHANNEL_ID>',
      )) as TextChannel;
    });
  }

  log(message: string) {
    this.sendDiscordMessage(this.logChannel, `📗 **Log:** ${message}`);
  }

  error(message: string, trace?: string) {
    this.sendDiscordMessage(
      this.errorChannel,
      `📕 **Error:** ${message}\n\`\`\`${trace}\`\`\``,
    );
  }

  warn(message: string) {
    this.sendDiscordMessage(this.logChannel, `📙 **Warn:** ${message}`);
  }

  debug?(message: string) {
    this.sendDiscordMessage(this.logChannel, `📘 **Debug:** ${message}`);
  }

  verbose?(message: string) {
    this.sendDiscordMessage(this.logChannel, `📓 **Verbose:** ${message}`);
  }

  private async sendDiscordMessage(channel: TextChannel, message: string) {
    if (channel && channel.isTextBased()) {
      channel
        .send(message)
        .catch((err) => console.error('Discord Message Error:', err));
    }
  }
}
