import '../src/config/load-env';
import { PrismaClient, Role, SpaceStatus, SpaceType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

// Organic layout — fits within RW=24, RD=20 room.
// Meeting rooms occupy x ∈ [-12,-6.5] and x ∈ [6.5,12], so desks stay in x ∈ [-5.5,5.5]
const deskPositions = [
  // Cluster A: top-left pod (2×2)
  { posX: -4.5, posZ: -6.5 }, // A1
  { posX: -2.5, posZ: -6.5 }, // A2
  { posX: -4.5, posZ: -4.5 }, // A3
  { posX: -2.5, posZ: -4.5 }, // A4
  // Cluster B: top-right (pair + L)
  { posX:  0.5, posZ: -6.5 }, // B1
  { posX:  2.5, posZ: -6.5 }, // B2
  { posX:  4.5, posZ: -6.5 }, // B3
  { posX:  4.5, posZ: -4.5 }, // B4 (L below B3)
  // Cluster C: mid-left (L shape)
  { posX: -5.0, posZ: -1.5 }, // C1
  { posX: -3.0, posZ: -1.5 }, // C2
  { posX: -5.0, posZ:  0.5 }, // C3
  // Centre singles
  { posX: -0.5, posZ: -2.0 }, // C4
  { posX:  1.5, posZ: -2.0 }, // D1
  // Cluster D: right-mid
  { posX:  3.5, posZ: -3.0 }, // D2
  { posX:  5.0, posZ: -3.0 }, // D3
  { posX:  5.0, posZ: -1.0 }, // D4
  // Cluster E: bottom
  { posX: -3.5, posZ:  3.5 }, // E1
  { posX: -1.5, posZ:  3.5 }, // E2
  { posX:  0.5, posZ:  4.0 }, // E3
  { posX:  3.0, posZ:  3.5 }, // E4
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
