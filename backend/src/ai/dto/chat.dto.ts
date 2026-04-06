import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ChatHistoryItem {
  @IsIn(['user', 'model'])
  role: 'user' | 'model';

  @IsString()
  @MaxLength(4000)
  parts: string;
}

export class ChatDto {
  @ApiProperty({ example: 'Какие места доступны сегодня?' })
  @IsString()
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({ type: [ChatHistoryItem] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItem)
  history?: ChatHistoryItem[];
}
