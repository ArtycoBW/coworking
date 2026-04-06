import '../src/config/load-env';
import { PrismaClient, Role, SpaceStatus, SpaceType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

// 8 desks, well-spaced 2×4 grid in the centre area x ∈ [-4.5,4.5], z ∈ [-7,3]
const deskPositions = [
  { posX: -4.5, posZ: -7.0 }, // A1
  { posX: -1.5, posZ: -7.0 }, // A2
  { posX:  1.5, posZ: -7.0 }, // A3
  { posX:  4.5, posZ: -7.0 }, // A4
  { posX: -4.5, posZ: -2.5 }, // B1
  { posX: -1.5, posZ: -2.5 }, // B2
  { posX:  1.5, posZ: -2.5 }, // B3
  { posX:  4.5, posZ: -2.5 }, // B4
];

const desks = deskPositions.map((pos, i) => ({
  name: `Desk ${String.fromCharCode(65 + Math.floor(i / 4))}${(i % 4) + 1}`,
  type: SpaceType.DESK,
  status: SpaceStatus.AVAILABLE,
  capacity: 1,
  description: 'Рабочее место с монитором и периферией.',
  amenities: ['monitor', 'keyboard', 'mouse', 'usb_hub', 'lamp'],
  posX: pos.posX,
  posY: 0,
  posZ: pos.posZ,
}));

const meetingRooms = [
  {
    name: 'Meeting Room Alpha',
    type: SpaceType.MEETING_ROOM,
    status: SpaceStatus.AVAILABLE,
    capacity: 8,
    description: 'Переговорная на 8 человек с проектором и видеосвязью.',
    amenities: ['projector', 'whiteboard', 'hdmi', 'webcam', 'coffee_machine'],
    posX: -9.2,
    posY: 0,
    posZ: -3.5,
  },
  {
    name: 'Meeting Room Beta',
    type: SpaceType.MEETING_ROOM,
    status: SpaceStatus.AVAILABLE,
    capacity: 8,
    description: 'Переговорная на 8 человек с большим TV-экраном.',
    amenities: ['tv_screen', 'whiteboard', 'hdmi', 'webcam', 'coffee_machine'],
    posX: 9.2,
    posY: 0,
    posZ: -3.5,
  },
];

async function main() {
  const defaultPassword = await bcrypt.hash('garage123', 10);

  await prisma.booking.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.space.deleteMany();

  await prisma.user.upsert({
    where: { email: 'admin@garage.dstu.ru' },
    update: { firstName: 'Garage', lastName: 'Admin', password: defaultPassword, role: Role.ADMIN },
    create: { email: 'admin@garage.dstu.ru', firstName: 'Garage', lastName: 'Admin', password: defaultPassword, role: Role.ADMIN },
  });

  await prisma.user.upsert({
    where: { email: 'test@dstu.ru' },
    update: { firstName: 'Тестовый', lastName: 'студент', password: defaultPassword, role: Role.USER },
    create: { email: 'test@dstu.ru', firstName: 'Тестовый', lastName: 'студент', password: defaultPassword, role: Role.USER },
  });

  await prisma.space.createMany({ data: [...desks, ...meetingRooms] });

  // Add some occupied bookings for April 6, 10, 15 so the map shows red spots
  const testUser = await prisma.user.findUnique({ where: { email: 'test@dstu.ru' } });
  const allSpaces = await prisma.space.findMany({ where: { type: SpaceType.DESK } });

  if (testUser && allSpaces.length >= 4) {
    const mkDate = (day: number, startH: number, endH: number) => ({
      startTime: new Date(`2026-04-${String(day).padStart(2,'0')}T${String(startH).padStart(2,'0')}:00:00.000Z`),
      endTime:   new Date(`2026-04-${String(day).padStart(2,'0')}T${String(endH).padStart(2,'0')}:00:00.000Z`),
    });

    const bookingsData = [
      { userId: testUser.id, spaceId: allSpaces[0].id, ...mkDate(6, 7, 11),  status: 'CONFIRMED' as const },
      { userId: testUser.id, spaceId: allSpaces[1].id, ...mkDate(6, 9, 13),  status: 'CONFIRMED' as const },
      { userId: testUser.id, spaceId: allSpaces[2].id, ...mkDate(10, 8, 12), status: 'CONFIRMED' as const },
      { userId: testUser.id, spaceId: allSpaces[3].id, ...mkDate(10, 10, 14),status: 'CONFIRMED' as const },
      { userId: testUser.id, spaceId: allSpaces[0].id, ...mkDate(15, 9, 17), status: 'CONFIRMED' as const },
      { userId: testUser.id, spaceId: allSpaces[2].id, ...mkDate(15, 8, 11), status: 'CONFIRMED' as const },
    ];

    await prisma.booking.createMany({ data: bookingsData });
    console.log(`✓ Seed completed: 2 users, ${desks.length} desks, ${meetingRooms.length} meeting rooms, ${bookingsData.length} bookings`);
  } else {
    console.log(`✓ Seed completed: 2 users, ${desks.length} desks, ${meetingRooms.length} meeting rooms`);
  }
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
