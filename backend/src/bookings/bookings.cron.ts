import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsCron {
  private readonly logger = new Logger(BookingsCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCompletedBookings() {
    const now = new Date();

    const completed = await this.prisma.booking.updateMany({
      where: {
        status: BookingStatus.CONFIRMED,
        endTime: { lt: now },
      },
      data: { status: BookingStatus.COMPLETED },
    });

    if (completed.count > 0) {
      this.logger.log(`Marked ${completed.count} bookings as COMPLETED`);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleNoShows() {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 15 * 60 * 1000); // 15 min ago

    const noShows = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.CONFIRMED,
        startTime: { lt: cutoff },
        endTime: { gt: now }, // still ongoing (not yet completed)
      },
      select: { id: true, userId: true, space: { select: { name: true } }, startTime: true, endTime: true },
    });

    for (const b of noShows) {
      const user = await this.prisma.user.findUnique({ where: { id: b.userId } });
      if (!user) continue;

      const newRating = Math.max(0, user.rating - 0.5);

      await this.prisma.$transaction([
        this.prisma.booking.update({
          where: { id: b.id },
          data: { status: BookingStatus.NO_SHOW },
        }),
        this.prisma.user.update({
          where: { id: b.userId },
          data: { rating: newRating },
        }),
        this.prisma.notification.create({
          data: {
            userId: b.userId,
            title: 'Неявка на бронирование',
            message: `Вы не явились в ${b.space.name}. Рейтинг снижен до ${newRating.toFixed(1)}`,
          },
        }),
      ]);

      this.logger.log(`NO_SHOW: booking ${b.id}, user ${b.userId}, rating ${user.rating} → ${newRating}`);
    }
  }
}
