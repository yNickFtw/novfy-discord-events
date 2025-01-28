import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscordService } from './discord/discord.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, DiscordService],
})
export class AppModule {}
