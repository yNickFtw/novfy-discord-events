import { Injectable } from '@nestjs/common';
import { Client, GatewayIntentBits, TextChannel, NewsChannel, ThreadChannel } from 'discord.js';

@Injectable()
export class DiscordService {
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });

    this.client.login(process.env.DISCORD_BOT_TOKEN);

    this.client.on('ready', () => {
      console.log(`Bot ${this.client.user?.tag} está online!`);
    });
  }

  async sendMessage(channelId: string, message: string): Promise<void> {
    const channel = await this.client.channels.fetch(channelId);

    if (channel instanceof TextChannel || channel instanceof NewsChannel || channel instanceof ThreadChannel) {
      await channel.send(message);
    } else {
      throw new Error('O canal não suporta envio de mensagens.');
    }
  }
}
