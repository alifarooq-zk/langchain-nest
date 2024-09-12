import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { CustomConfigModule } from 'src/config/config.module';

@Module({
  imports: [CustomConfigModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
