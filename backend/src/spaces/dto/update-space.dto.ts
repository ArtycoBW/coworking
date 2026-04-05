import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { SpaceStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateSpaceDto } from './create-space.dto';

export class UpdateSpaceDto extends PartialType(CreateSpaceDto) {
  @ApiPropertyOptional({ enum: SpaceStatus })
  @IsOptional()
  @IsEnum(SpaceStatus)
  status?: SpaceStatus;
}
