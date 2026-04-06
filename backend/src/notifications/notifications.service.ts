import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../websocket/notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) {}

  findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(id: string, userId: string) {
    const n = await this.prisma.notification.findUnique({ where: { id } });
    if (!n) throw new NotFoundException('Уведомление не найдено');
    if (n.userId !== userId) throw new ForbiddenException('Нет доступа');
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  /** Create notification and push it via WebSocket */
  async createAndPush(userId: string, title: string, message: string) {
    const notification = await this.prisma.notification.create({
      data: { userId, title, message },
    });
    this.gateway.sendNotificationToUser(userId, {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
    });
    return notification;
  }
}
