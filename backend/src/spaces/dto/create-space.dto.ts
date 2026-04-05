import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpaceType } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSpaceDto {
  @ApiProperty({ example: 'Desk A1' })
  @IsString()
  @MaxLength(64)
  name: string;

  @ApiProperty({ enum: SpaceType })
  @IsEnum(SpaceType)
  type: SpaceType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiProperty()
  @IsNumber()
  posX: number;

  @ApiProperty()
  @IsNumber()
  posY: number;

  @ApiProperty()
  @IsNumber()
  posZ: number;
}
