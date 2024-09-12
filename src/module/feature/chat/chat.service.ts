import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BasicMessageDto } from './dto/basic-message.dto';
import { PromptTemplate } from '@langchain/core/prompts';
import { TEMPLATES } from 'src/utils/feature/template.constant';
import { ChatOpenAI } from '@langchain/openai';
import { openAI } from 'src/utils/feature/openai.constant';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { ConfigService } from '@nestjs/config';
import { ContextAwareMessagesDto } from './dto/context-aware-message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly configService: ConfigService) {}

  async basicChat(messageDto: BasicMessageDto) {
    try {
      const chain = this.loadSingleChain(TEMPLATES.BASIC_CHAT_TEMPLATE);
      const response = await chain.invoke({
        input: messageDto.user_query,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'success',
        data: Object.values(response)
          .map((code) => String.fromCharCode(code))
          .join(''),
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async contextAwareChat(contextAwareMessagesDto: ContextAwareMessagesDto) {
    try {
      const messages = contextAwareMessagesDto.messages ?? [];
      const formattedPreviousMessages = messages
        .slice(0, -1)
        .map((message) => `${message.role}: ${message.content}`)
        .join('\n');

      const currentMessageContent = messages[messages.length - 1].content;

      const chain = this.loadSingleChain(TEMPLATES.CONTEXT_AWARE_CHAT_TEMPLATE);

      const response = await chain.invoke({
        chat_history: formattedPreviousMessages,
        input: currentMessageContent,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'success',
        data: Object.values(response)
          .map((code) => String.fromCharCode(code))
          .join(''),
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  private loadSingleChain = (template: string) => {
    const prompt = PromptTemplate.fromTemplate(template);

    const model = new ChatOpenAI({
      openAIApiKey: this.configService.get('app.openAiApiKey'),
      temperature: +openAI.BASIC_CHAT_OPENAI_TEMPERATURE,
      modelName: openAI.GPT_3_5_TURBO_1106.toString(),
    });

    const outputParser = new HttpResponseOutputParser();

    return prompt.pipe(model).pipe(outputParser);
  };
}
