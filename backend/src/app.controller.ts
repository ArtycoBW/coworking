import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('system')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getOverview() {
    return this.appService.getSystemStatus();
  }

  @Get('health')
  getHealth() {
    return this.appService.getSystemStatus();
  }
}
