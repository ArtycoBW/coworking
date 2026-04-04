import { ConflictException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: jest.Mocked<Pick<PrismaService, 'user'>>;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as jest.Mocked<Pick<PrismaService, 'user'>>;

    service = new UsersService(prisma as PrismaService);
  });

  it('returns current user without password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@dstu.ru',
      password: '$2b$10$hashed',
      name: 'Иван Иванов',
      studentId: 'DSTU-2026-001',
      role: Role.USER,
      rating: 5,
      createdAt: new Date('2026-04-04T00:00:00.000Z'),
      updatedAt: new Date('2026-04-04T00:00:00.000Z'),
    });

    const result = await service.getCurrentUser('user-1');

    expect(result.email).toBe('test@dstu.ru');
    expect(result).not.toHaveProperty('password');
  });

  it('updates profile data', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      email: 'test@dstu.ru',
      password: '$2b$10$hashed',
      name: 'Иван Петров',
      studentId: 'DSTU-2026-002',
      role: Role.USER,
      rating: 5,
      createdAt: new Date('2026-04-04T00:00:00.000Z'),
      updatedAt: new Date('2026-04-04T00:00:00.000Z'),
    });

    const result = await service.updateCurrentUser('user-1', {
      name: 'Иван Петров',
      studentId: 'DSTU-2026-002',
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        name: 'Иван Петров',
        studentId: 'DSTU-2026-002',
      },
    });
    expect(result.studentId).toBe('DSTU-2026-002');
    expect(result).not.toHaveProperty('password');
  });

  it('throws conflict when student id belongs to another user', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'other-user' } as never);

    await expect(
      service.updateCurrentUser('user-1', {
        studentId: 'DSTU-2026-009',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws not found when user is missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.getUserById('missing-user')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
