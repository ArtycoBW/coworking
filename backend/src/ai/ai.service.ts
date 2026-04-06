import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatDto } from './dto/chat.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelName = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

  constructor(private readonly prisma: PrismaService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
  }

  async chat(userId: string, dto: ChatDto): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return 'Пользователь не найден.';
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart.getTime() + 86_400_000);

    const upcomingBookings = await this.prisma.booking.findMany({
      where: {
        userId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        startTime: { gte: now },
      },
      include: { space: true },
      orderBy: { startTime: 'asc' },
      take: 5,
    });

    const bookedTodayIds = await this.prisma.booking
      .findMany({
        where: {
          status: { in: ['CONFIRMED', 'PENDING'] },
          startTime: { lt: tomorrowStart },
          endTime: { gt: todayStart },
        },
        select: { spaceId: true },
      })
      .then((rows) => rows.map((row) => row.spaceId));

    const allSpaces = await this.prisma.space.findMany({ orderBy: { name: 'asc' } });
    const freeToday = allSpaces.filter(
      (space) => space.status === 'AVAILABLE' && !bookedTodayIds.includes(space.id),
    );

    const fmt = (date: Date) =>
      date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Moscow',
      });

    const spaceName = (space: { name: string }) =>
      space.name
        .replace('Desk ', 'Место ')
        .replace('Meeting Room ', 'Переговорная ');

    const systemInstruction = `
Ты — ARIA, AI-ассистент коворкинга GARAGE при ДГТУ (Донской государственный технический университет).

Правила коворкинга:
- Режим работы: 08:00-22:00 ежедневно
- Бронирование: минимум 30 минут, максимум до 22:00
- Отмена: возможна через личный кабинет до начала брони
- Рейтинг: снижается при неявке (NO_SHOW); при рейтинге ниже 2.0 бронирование заблокировано
- Рабочие места (DESK): монитор, клавиатура, мышь, USB-хаб, лампа
- Переговорные (MEETING_ROOM): проектор или TV, whiteboard, веб-камера, кофемашина, до 8 человек

Текущий пользователь:
- Имя: ${user.firstName} ${user.lastName}
- Email: ${user.email}
- Роль: ${user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
- Рейтинг: ${user.rating.toFixed(1)} / 5.0

Предстоящие бронирования (${upcomingBookings.length}):
${
  upcomingBookings.length === 0
    ? '  нет'
    : upcomingBookings
        .map((booking) => `  - ${spaceName(booking.space)} · ${fmt(booking.startTime)} - ${fmt(booking.endTime)}`)
        .join('\n')
}

Все пространства (${allSpaces.length}):
${allSpaces
  .map((space) =>
    `  - ${spaceName(space)} | ${
      space.type === 'DESK' ? 'Рабочее место' : `Переговорная, ${space.capacity} чел.`
    } | ${
      space.status === 'AVAILABLE'
        ? 'доступно'
        : space.status === 'OCCUPIED'
          ? 'занято'
          : 'на обслуживании'
    }`,
  )
  .join('\n')}

Свободно сегодня: ${freeToday.filter((space) => space.type === 'DESK').length} рабочих мест, ${freeToday.filter((space) => space.type === 'MEETING_ROOM').length} переговорных
Текущее время: ${fmt(now)}

Инструкции:
- Отвечай только на русском языке
- Будь кратким и полезным
- Для бронирования направляй пользователя в раздел «Забронировать» на дашборде
- Не придумывай возможностей системы, которых нет
`.trim();

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction,
      });

      const history = (dto.history ?? []).map((item) => ({
        role: item.role,
        parts: [{ text: item.parts }],
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(dto.message);

      return result.response.text();
    } catch (error) {
      this.logger.error(`Gemini API error for model "${this.modelName}"`, error);
      return 'Сервис временно недоступен. Попробуй позже.';
    }
  }
}
