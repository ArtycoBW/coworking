import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { BookingsController } from './bookings.controller';
import { BookingsCron } from './bookings.cron';
import { BookingsService } from './bookings.service';

@Module({
  imports: [PrismaModule, NotificationsModule, WebsocketModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsCron],
})
export class BookingsModule {}
