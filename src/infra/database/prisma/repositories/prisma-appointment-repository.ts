import { Appointment } from '@/domain/enterprise/entities/appointment';
import { AppointmentRepository } from '@/domain/repositories/appointment-repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PrismaAppointmentMapper } from '../mappers/prisma-appointment.mapper';

@Injectable()
export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(private prisma: PrismaService) {}

  async create(appointment: Appointment): Promise<Appointment> {
    const PrismaAppointment = await this.prisma.appointment.create({
      data: PrismaAppointmentMapper.toPrisma(appointment),
    });

    return PrismaAppointmentMapper.toDomain(PrismaAppointment);
  }
  async findById(id: string): Promise<Appointment | null> {
    const appointment = await this.prisma.appointment.findUnique({
      where: {
        id,
      },
    });

    if (!appointment) {
      return null;
    }

    return PrismaAppointmentMapper.toDomain(appointment);
  }
  async findByDate(organizationId: string, date: Date): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        organizationId,
        date,
      },
    });

    return appointments.map(PrismaAppointmentMapper.toDomain);
  }
  async findByDateRange(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        organizationId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return appointments.map(PrismaAppointmentMapper.toDomain);
  }

  async listByMonth(
    organizationId: string,
    month: number,
    year: number,
  ): Promise<Appointment[]> {

    const appointments = await this.prisma.appointment.findMany({
      where: {
        organizationId,
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month - 1, 32),
        },
      },
    });

    return appointments.map(PrismaAppointmentMapper.toDomain);
  }
  async save(id: string, appointment: Appointment): Promise<Appointment> {
    const PrismaAppointment = await this.prisma.appointment.update({
      where: {
        id,
      },
      data: PrismaAppointmentMapper.toPrisma(appointment),
    });

    return PrismaAppointmentMapper.toDomain(PrismaAppointment);
  }
  async delete(id: string): Promise<void> {
    await this.prisma.appointment.delete({
      where: {
        id,
      },
    });
  }
}
