import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpaceType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class AvailabilityQueryDto {
  @ApiProperty({ example: '2025-06-01T09:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2025-06-01T18:00:00Z' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ enum: SpaceType })
  @IsOptional()
  @IsEnum(SpaceType)
  @Transform(({ value }: { value: unknown }) => value || undefined)
  type?: SpaceType;
}
