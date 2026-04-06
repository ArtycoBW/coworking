import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../websocket/notifications.gateway';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly gateway: NotificationsGateway,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    const now = new Date();

    if (end <= start) throw new BadRequestException('Время окончания должно быть позже начала');
    if (start < now) throw new BadRequestException('Нельзя бронировать в прошлом');

    const startH = start.getUTCHours();
    const endH = end.getUTCHours();
    const endM = end.getUTCMinutes();
    if (startH < 8 || endH > 22 || (endH === 22 && endM > 0)) {
      throw new BadRequestException('Бронирование доступно с 08:00 до 22:00');
    }

    const space = await this.prisma.space.findUnique({ where: { id: dto.spaceId } });
    if (!space) throw new NotFoundException('Пространство не найдено');
    if (space.status === 'MAINTENANCE') throw new BadRequestException('Пространство на обслуживании');

    const overlap = await this.prisma.booking.findFirst({
      where: {
        spaceId: dto.spaceId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (overlap) throw new ConflictException('Пространство уже занято в этот период');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    if (user.rating < 2.0) {
      throw new ForbiddenException(
        `Бронирование недоступно: ваш рейтинг ${user.rating.toFixed(1)} ниже минимального (2.0)`,
      );
    }

    const booking = await this.prisma.booking.create({
      data: {
        userId,
        spaceId: dto.spaceId,
        startTime: start,
        endTime: end,
        status: BookingStatus.CONFIRMED,
        notes: dto.notes,
      },
      include: { space: true },
    });

    // Push notification via WebSocket
    await this.notifications.createAndPush(
      userId,
      'Бронирование подтверждено',
      `${space.name} · ${this.formatTime(start)} – ${this.formatTime(end)}`,
    );

    // Broadcast space change to all clients (3D map updates)
    this.gateway.broadcastBookingChanged(dto.spaceId);

    return booking;
  }

  findMy(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: { space: true },
      orderBy: { startTime: 'desc' },
    });
  }

  findAll() {
    return this.prisma.booking.findMany({
      include: { space: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancel(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { space: true },
    });
    if (!booking) throw new NotFoundException('Бронирование не найдено');
    if (booking.userId !== userId) throw new ForbiddenException('Нет доступа');
    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Нельзя отменить бронирование в текущем статусе');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: { space: true },
    });

    await this.notifications.createAndPush(
      userId,
      'Бронирование отменено',
      `${booking.space.name} · ${this.formatTime(booking.startTime)} – ${this.formatTime(booking.endTime)}`,
    );

    this.gateway.broadcastBookingChanged(booking.spaceId);

    return updated;
  }

  async forceStatus(id: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { space: true },
    });
    if (!booking) throw new NotFoundException('Бронирование не найдено');

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status },
      include: { space: true, user: { select: { id: true, name: true, email: true } } },
    });

    // Notify the user about admin status change
    await this.notifications.createAndPush(
      booking.userId,
      'Статус бронирования изменён',
      `${booking.space.name}: статус изменён на ${status}`,
    );

    this.gateway.broadcastBookingChanged(booking.spaceId);

    return updated;
  }

  private formatTime(d: Date) {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  }
}
