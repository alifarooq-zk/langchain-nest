import { Controller } from '@nestjs/common';
import { Body, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { BasicMessageDto } from './dto/basic-message.dto';
import { ContextAwareMessagesDto } from './dto/context-aware-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('basic')
  async basicChat(@Body() messagesDto: BasicMessageDto) {
    return await this.chatService.basicChat(messagesDto);
  }

  @Post('context-aware')
  async contextAwareChat(
    @Body() contextAwareMessagesDto: ContextAwareMessagesDto,
  ) {
    return await this.chatService.contextAwareChat(
      contextAwareMessagesDto,
    );
  }
}
