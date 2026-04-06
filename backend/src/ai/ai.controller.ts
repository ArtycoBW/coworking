import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(
    @Req() req: { user: JwtUser },
    @Body() dto: ChatDto,
  ): Promise<{ reply: string }> {
    const reply = await this.aiService.chat(req.user.userId, dto);
    return { reply };
  }
}
