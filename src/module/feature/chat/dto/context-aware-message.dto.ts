import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum RoleEnum {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export class MessageDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(RoleEnum)
  role: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}

export class ContextAwareMessagesDto {
  @IsNotEmpty()
  @IsArray()
  messages: MessageDto[];
}
