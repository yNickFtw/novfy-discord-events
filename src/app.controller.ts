import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { DiscordService } from './discord/discord.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly discordService: DiscordService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('send')
  public async sendMessage(@Body() body: { event: string; message: string; metadata: string; }): Promise<{ message: string }> {
    const { event, message, metadata } = body;

    if (!event || !message || !metadata) {
      throw new BadRequestException('Event, message and metadata are required.');
    }
    
    let finalMessage = `
    EVENTO: ${event}
    
    Mensagem: ${message}

    Metadata: ${metadata}
`

    await this.discordService.sendMessage(process.env.DISCORD_CHANNEL_ID, finalMessage);

    return { message: "Event received" }
  }
}
