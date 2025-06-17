import { Schedule } from '@/domain/enterprise/entities/schedule';
import { ScheduleRepository } from '@/domain/repositories/schedule-repository';
import { PrismaScheduleMapper } from '../mappers/prisma-schedule.mapper';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaScheduleRepository implements ScheduleRepository {
  constructor(private prisma: PrismaService) {}

  async create(schedule: Schedule): Promise<Schedule> {
    const prismaSchedule = await this.prisma.schedule.create({
      data: PrismaScheduleMapper.toPrisma(schedule),
    });

    return PrismaScheduleMapper.toDomain(prismaSchedule);
  }

  async findById(id: string): Promise<Schedule | null> {
    const schedule = await this.prisma.schedule.findUnique({
      where: {
        id,
      },
    });

    if (!schedule) {
      return null;
    }

    return PrismaScheduleMapper.toDomain(schedule);
  }

  async findAllByOrganizationId(organizationId: string): Promise<Schedule[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        weekDay: 'asc',
      },
    });

    return schedules.map(PrismaScheduleMapper.toDomain);
  }

  async findAll(): Promise<Schedule[]> {
    const schedules = await this.prisma.schedule.findMany();

    return schedules.map(PrismaScheduleMapper.toDomain);
  }

  async save(id: string, data: Schedule): Promise<Schedule> {
    const prismaSchedule = PrismaScheduleMapper.toPrisma(data);

    const schedule = await this.prisma.schedule.update({
      where: {
        id,
      },
      data: prismaSchedule,
    });

    return PrismaScheduleMapper.toDomain(schedule);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.schedule.delete({
      where: {
        id,
      },
    });
  }
}
