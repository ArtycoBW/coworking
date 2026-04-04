import bcrypt from 'bcryptjs';
import { PrismaClient, Role, SpaceStatus, SpaceType } from '@prisma/client';

const prisma = new PrismaClient();

const deskSpaces = Array.from({ length: 18 }, (_, index) => ({
  name: `Desk ${String(index + 1).padStart(2, '0')}`,
  type: SpaceType.DESK,
  status: SpaceStatus.AVAILABLE,
  capacity: 1,
  description: 'Открытое рабочее место в общей зоне коворкинга.',
  amenities: ['Wi-Fi', 'Power', 'Monitor'],
  posX: (index % 6) * 1.35 - 3.4,
  posY: 0,
  posZ: Math.floor(index / 6) * 1.5 - 2.2,
}));

const meetingRooms = [
  {
    name: 'Meeting Room A',
    type: SpaceType.MEETING_ROOM,
    status: SpaceStatus.AVAILABLE,
    capacity: 4,
    description: 'Переговорная для коротких встреч и созвонов.',
    amenities: ['TV', 'Whiteboard', 'Video Call Kit'],
    posX: -4.6,
    posY: 0,
    posZ: 2.8,
  },
  {
    name: 'Meeting Room B',
    type: SpaceType.MEETING_ROOM,
    status: SpaceStatus.AVAILABLE,
    capacity: 6,
    description: 'Средняя переговорная для командных обсуждений.',
    amenities: ['TV', 'Whiteboard', 'Air Conditioning'],
    posX: -1.5,
    posY: 0,
    posZ: 2.8,
  },
  {
    name: 'Meeting Room C',
    type: SpaceType.MEETING_ROOM,
    status: SpaceStatus.AVAILABLE,
    capacity: 8,
    description: 'Большая переговорная для презентаций и воркшопов.',
    amenities: ['Projector', 'Soundbar', 'Whiteboard'],
    posX: 1.6,
    posY: 0,
    posZ: 2.8,
  },
  {
    name: 'Meeting Room D',
    type: SpaceType.MEETING_ROOM,
    status: SpaceStatus.MAINTENANCE,
    capacity: 4,
    description: 'Переговорная в резерве для сервисных работ.',
    amenities: ['TV', 'Air Conditioning'],
    posX: 4.7,
    posY: 0,
    posZ: 2.8,
  },
];

async function main() {
  const defaultPassword = await bcrypt.hash('garage123', 10);

  await prisma.booking.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.space.deleteMany();

  await prisma.user.upsert({
    where: { email: 'admin@garage.dstu.ru' },
    update: {
      name: 'Garage Admin',
      password: defaultPassword,
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@garage.dstu.ru',
      name: 'Garage Admin',
      password: defaultPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'test@dstu.ru' },
    update: {
      name: 'Тестовый студент',
      password: defaultPassword,
      studentId: 'DSTU-2026-001',
      role: Role.USER,
    },
    create: {
      email: 'test@dstu.ru',
      name: 'Тестовый студент',
      password: defaultPassword,
      studentId: 'DSTU-2026-001',
      role: Role.USER,
    },
  });

  await prisma.space.createMany({
    data: [...deskSpaces, ...meetingRooms],
  });

  console.log('Seed completed:', {
    users: 2,
    spaces: deskSpaces.length + meetingRooms.length,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
