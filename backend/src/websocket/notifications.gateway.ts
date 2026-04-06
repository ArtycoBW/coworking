import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  // userId → Set of socket ids
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers?.authorization as string)?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'garage-dev-jwt-secret',
      });

      const userId = payload.sub;
      client.data.userId = userId;

      // Join personal room
      await client.join(`user:${userId}`);

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      this.logger.log(`Client connected: ${client.id} → user:${userId}`);
    } catch {
      this.logger.warn(`Unauthorized WS connection: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId as string | undefined;
    if (userId) {
      this.userSockets.get(userId)?.delete(client.id);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /** Send a notification to a specific user */
  sendNotificationToUser(
    userId: string,
    notification: { id: string; title: string; message: string; createdAt: Date },
  ) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  /** Broadcast space status change to all connected clients */
  broadcastSpaceStatusChanged(spaceId: string, status: string) {
    this.server.emit('space_status_changed', { spaceId, status });
  }

  /** Broadcast new booking to all (so 3D map updates) */
  broadcastBookingChanged(spaceId: string) {
    this.server.emit('booking_changed', { spaceId });
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', { ts: Date.now() });
  }
}
