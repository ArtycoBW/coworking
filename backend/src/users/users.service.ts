import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { toSafeUser } from './user.mapper';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toSafeUser(user);
  }

  async updateCurrentUser(userId: string, dto: UpdateProfileDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName?.trim() ? { firstName: dto.firstName.trim() } : {}),
        ...(dto.lastName?.trim() ? { lastName: dto.lastName.trim() } : {}),
      },
    });

    return toSafeUser(updatedUser);
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toSafeUser(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return users.map(toSafeUser);
  }

  async adminUpdate(userId: string, dto: import('./dto/update-user-admin.dto').UpdateUserAdminDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName?.trim() ? { firstName: dto.firstName.trim() } : {}),
        ...(dto.lastName?.trim() ? { lastName: dto.lastName.trim() } : {}),
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.rating !== undefined ? { rating: Math.round(dto.rating * 10) / 10 } : {}),
      },
    });

    return toSafeUser(updated);
  }
}
