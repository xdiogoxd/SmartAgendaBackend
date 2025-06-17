import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Schedule, ScheduleProps } from '@/domain/enterprise/entities/schedule';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaScheduleMapper } from '@/infra/database/prisma/mappers/prisma-schedule.mapper';

export function makeSchedule(
  override: Partial<ScheduleProps> = {},
  id?: UniqueEntityID,
): Schedule[] {
  const schedules = [];

  for (let i = 0; i <= 6; i++) {
    const schedule = Schedule.create(
      {
        organizationId: new UniqueEntityID(),
        weekDay: i,
        startHour: faker.number.int({ min: 480, max: 600 }),
        endHour: faker.number.int({ min: 1080, max: 1200 }),
        createdAt: faker.date.recent(),
        ...override,
      },
      id,
    );
    schedules.push(schedule);
  }
  return schedules;
}

@Injectable()
export class ScheduleFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaSchedule(
    data: Partial<ScheduleProps> = {},
    organizationId: UniqueEntityID,
  ): Promise<Schedule[]> {
    data.organizationId = organizationId;
    const schedules = makeSchedule(data);

    await this.prisma.schedule.createMany({
      data: schedules.map((schedule) =>
        PrismaScheduleMapper.toPrisma(schedule),
      ),
    });

    return schedules;
  }
}
