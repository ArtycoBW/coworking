import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getSystemStatus() {
    return {
      name: 'Garage Coworking API',
      status: 'ok',
      docs: '/api',
      version: '0.1.0',
    };
  }
}
