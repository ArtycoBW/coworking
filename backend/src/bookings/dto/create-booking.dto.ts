import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'clxyz123' })
  @IsString()
  spaceId: string;

  @ApiProperty({ example: '2026-04-10T09:00:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-04-10T11:00:00.000Z' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ example: 'Нужен второй монитор' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
