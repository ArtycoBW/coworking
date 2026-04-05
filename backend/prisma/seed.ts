import '../src/config/load-env';
import { PrismaClient, Role, SpaceStatus, SpaceType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const desks = Array.from({ length: 20 }, (_, i) => ({
  name: `Desk ${String.fromCharCode(65 + Math.floor(i / 4))}${(i % 4) + 1}`,
  type: SpaceType.DESK,
  status: SpaceStatus.AVAILABLE,
  capacity: 1,
  description: 'Рабочее место с монитором и периферией.',
  amenities: ['monitor', 'keyboard', 'mouse', 'usb_hub', 'lamp'],
  posX: (i % 5) * 3.5 - 7,
  posY: 0,
  posZ: Math.floor(i / 5) * 3 - 4.5,
}));

const meetingRooms = [
  {
    name: 'Meeting Room Alpha',
    type: SpaceType.MEETING_ROOM,
    status: SpaceStatus.AVAILABLE,
    capacity: 8,
    description: 'Переговорная на 8 человек с проектором и видеосвязью.',
    amenities: ['projector', 'whiteboard', 'hdmi', 'webcam', 'coffee_machine'],
    posX: -9,
    posY: 0,
    posZ: 0,
  },
  {
    name: 'Meeting Room Beta',
    type: SpaceType.MEETING_ROOM,
    status: SpaceStatus.AVAILABLE,
    capacity: 8,
    description: 'Переговорная на 8 человек с большим TV-экраном.',
    amenities: ['tv_screen', 'whiteboard', 'hdmi', 'webcam', 'coffee_machine'],
    posX: 9,
    posY: 0,
    posZ: 0,
  },
];

async function main() {
  const defaultPassword = await bcrypt.hash('garage123', 10);

  await prisma.booking.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.space.deleteMany();

  await prisma.user.upsert({
    where: { email: 'admin@garage.dstu.ru' },
    update: { name: 'Garage Admin', password: defaultPassword, role: Role.ADMIN },
    create: { email: 'admin@garage.dstu.ru', name: 'Garage Admin', password: defaultPassword, role: Role.ADMIN },
  });

  await prisma.user.upsert({
    where: { email: 'test@dstu.ru' },
    update: { name: 'Тестовый студент', password: defaultPassword, studentId: 'DSTU-2026-001', role: Role.USER },
    create: { email: 'test@dstu.ru', name: 'Тестовый студент', password: defaultPassword, studentId: 'DSTU-2026-001', role: Role.USER },
  });

  await prisma.space.createMany({ data: [...desks, ...meetingRooms] });

  console.log(`✓ Seed completed: 2 users, ${desks.length} desks, ${meetingRooms.length} meeting rooms`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
