import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SpaceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Injectable()
export class SpacesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.space.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findAvailable(query: AvailabilityQueryDto) {
    const start = new Date(query.startTime);
    const end = new Date(query.endTime);

    const bookedSpaceIds = await this.prisma.booking
      .findMany({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          OR: [
            { startTime: { lt: end }, endTime: { gt: start } },
          ],
        },
        select: { spaceId: true },
      })
      .then((rows) => rows.map((r) => r.spaceId));

    return this.prisma.space.findMany({
      where: {
        status: SpaceStatus.AVAILABLE,
        ...(query.type ? { type: query.type } : {}),
        id: { notIn: bookedSpaceIds },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const space = await this.prisma.space.findUnique({ where: { id } });
    if (!space) throw new NotFoundException('Space not found');
    return space;
  }

  create(dto: CreateSpaceDto) {
    return this.prisma.space.create({
      data: {
        name: dto.name,
        type: dto.type,
        capacity: dto.capacity ?? 1,
        description: dto.description,
        amenities: dto.amenities ?? [],
        posX: dto.posX,
        posY: dto.posY,
        posZ: dto.posZ,
      },
    });
  }

  async update(id: string, dto: UpdateSpaceDto) {
    await this.findOne(id);
    return this.prisma.space.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.space.delete({ where: { id } });
  }
}
