import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: jest.Mocked<Pick<PrismaService, 'user'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    } as unknown as jest.Mocked<Pick<PrismaService, 'user'>>;

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };

    service = new AuthService(
      prisma as PrismaService,
      jwtService as JwtService,
    );
  });

  it('registers a new user and returns token without password', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    prisma.user.create.mockResolvedValue({
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

    const result = await service.register({
      email: 'test@dstu.ru',
      password: 'Test123!',
      name: 'Иван Иванов',
      studentId: 'DSTU-2026-001',
    });

    expect(prisma.user.create).toHaveBeenCalled();
    expect(result.access_token).toBe('signed-token');
    expect(result.user).toMatchObject({
      id: 'user-1',
      email: 'test@dstu.ru',
      name: 'Иван Иванов',
      studentId: 'DSTU-2026-001',
      role: Role.USER,
      rating: 5,
    });
    expect(result.user).not.toHaveProperty('password');
  });

  it('throws conflict when email is already in use', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-user' } as never);

    await expect(
      service.register({
        email: 'test@dstu.ru',
        password: 'Test123!',
        name: 'Иван Иванов',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in a user with valid credentials', async () => {
    const hashedPassword = await bcrypt.hash('Test123!', 10);

    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@dstu.ru',
      password: hashedPassword,
      name: 'Иван Иванов',
      studentId: null,
      role: Role.USER,
      rating: 5,
      createdAt: new Date('2026-04-04T00:00:00.000Z'),
      updatedAt: new Date('2026-04-04T00:00:00.000Z'),
    });

    const result = await service.login({
      email: 'test@dstu.ru',
      password: 'Test123!',
    });

    expect(result.access_token).toBe('signed-token');
    expect(result.user.email).toBe('test@dstu.ru');
    expect(result.user).not.toHaveProperty('password');
  });

  it('throws unauthorized for invalid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@dstu.ru',
        password: 'Test123!',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
