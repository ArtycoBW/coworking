import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: jest.Mocked<Pick<PrismaService, 'user'>>;

  const mockUser = {
    id: 'user-1',
    email: 'test@dstu.ru',
    password: '$2b$10$hashed',
    firstName: 'Иван',
    lastName: 'Иванов',
    role: Role.USER,
    rating: 5,
    createdAt: new Date('2026-04-04T00:00:00.000Z'),
    updatedAt: new Date('2026-04-04T00:00:00.000Z'),
  };

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
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await service.getCurrentUser('user-1');

    expect(result.email).toBe('test@dstu.ru');
    expect(result.name).toBe('Иван Иванов');
    expect(result).not.toHaveProperty('password');
  });

  it('updates profile firstName/lastName', async () => {
    prisma.user.update.mockResolvedValue({ ...mockUser, firstName: 'Пётр', lastName: 'Петров' });

    const result = await service.updateCurrentUser('user-1', {
      firstName: 'Пётр',
      lastName: 'Петров',
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { firstName: 'Пётр', lastName: 'Петров' },
    });
    expect(result.name).toBe('Пётр Петров');
    expect(result).not.toHaveProperty('password');
  });

  it('throws not found when user is missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.getUserById('missing-user')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
