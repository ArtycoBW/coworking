import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should expose service status', () => {
      expect(appController.getOverview()).toEqual({
        name: 'Garage Coworking API',
        status: 'ok',
        docs: '/api',
        version: '0.1.0',
      });
    });
  });
});
