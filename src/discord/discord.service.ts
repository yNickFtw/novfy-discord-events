import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  Client,
  GatewayIntentBits,
  TextChannel,
  NewsChannel,
  ThreadChannel,
  SlashCommandBuilder,
  REST,
  Routes,
} from 'discord.js';

@Injectable()
export class DiscordService {
  private client: Client;
  private readonly apiAmorizados: AxiosInstance = axios.create({
    baseURL: process.env.AMORIZADOS_API,
  });
  private loginAmorizados: string = process.env.AMORIZADOS_LOGIN;
  private passwordAmorizados: string = process.env.AMORIZADOS_PASSWORD;
  private amorizadosAccessToken: string = '';

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });

    const rest = new REST({ version: '10' }).setToken(
      process.env.DISCORD_BOT_TOKEN,
    );

    this.apiAmorizados.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${this.amorizadosAccessToken}`;

      return config;
    });

    this.apiAmorizados.interceptors.response.use((response) => response, (error) => {
      if (error.response.status === 401) {
        (async () => await this.getAccessToken())();
      }

      return Promise.reject(error);
    });

    (async () => await this.getAccessToken())();

    this.client.login(process.env.DISCORD_BOT_TOKEN);

    this.client.on('ready', async () => {
      console.log(`Bot ${this.client.user?.tag} está online!`);

      const commands = [
        new SlashCommandBuilder()
          .setName('ping')
          .setDescription('Responde com Pong!'),
        new SlashCommandBuilder()
          .setName('relationships')
          .setDescription('Mostra a quantidade de relacionamentos cadastrados na plataforma'),
      ];

      const CLIENT_ID = this.client.user.id;
      const GUILD_ID = process.env.DISCORD_GUILD_ID;

      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: commands,
      });

      console.log('Comando /ping registrado!');
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const { commandName } = interaction;

      if (commandName === 'ping') {
        await interaction.reply('Pong!');
      }

      if (commandName === "relationships") {
        try {
          const response = await this.apiAmorizados.get('/discord/relationships', {
            headers: {
              Authorization: `Bearer ${this.amorizadosAccessToken}`
            }
          });

          if (response && response.data) {
            const { relationships } = response.data;

            await interaction.reply({
              content: `Quantidade de relacionamentos: ${relationships}`,
              ephemeral: true,
            });
          }
        } catch (error) {

          await interaction.reply({
            content: 'Ocorreu um erro ao buscar os relacionamentos.',
            ephemeral: true,
          });

          console.log(error);
        }
      }
    });
    
  }

  async sendMessage(channelId: string, message: string): Promise<void> {
    const channel = await this.client.channels.fetch(channelId);

    if (
      channel instanceof TextChannel ||
      channel instanceof NewsChannel ||
      channel instanceof ThreadChannel
    ) {
      await channel.send(message);
    } else {
      throw new Error('O canal não suporta envio de mensagens.');
    }
  }

  private async getAccessToken() {
    try {
      const response = await this.apiAmorizados.post('/authenticate', {
        email: this.loginAmorizados,
        password: this.passwordAmorizados,
      });
      
      if (response && response.data) {
        const { auth } = response.data;
  
        this.amorizadosAccessToken = auth.accessToken

        console.log("Amorizados API - Autenticado com sucesso!");
      }
    } catch (error) {
      throw error;
    }
  }
}
