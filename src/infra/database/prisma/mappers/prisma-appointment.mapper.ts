import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Appointment } from '@/domain/enterprise/entities/appointment';
import { convertAppointmentStringToEnum } from '@/domain/utils/convert-appointment-string-to-enum';

import { Prisma, appointment as PrismaAppointment } from '@prisma/client';

export class PrismaAppointmentMapper {
  static toDomain(raw: PrismaAppointment): Appointment {
    const status = convertAppointmentStringToEnum(raw.status);

    return Appointment.create(
      {
        date: raw.date,
        description: raw.description,
        observations: raw.observations,
        status,
        organizationId: new UniqueEntityID(raw.organizationId),
        serviceId: new UniqueEntityID(raw.serviceId),
        spaceOfServiceId: new UniqueEntityID(raw.spaceOfServiceId),
        customerId: new UniqueEntityID(raw.customerId),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        canceledAt: raw.canceledAt,
        finishedAt: raw.finishedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(
    appointment: Appointment,
  ): Prisma.appointmentUncheckedCreateInput {
    return {
      id: appointment.id.toString(),
      date: appointment.date,
      description: appointment.description,
      observations: appointment.observations,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      canceledAt: appointment.canceledAt,
      finishedAt: appointment.finishedAt,
      organizationId: appointment.organizationId.toString(),
      serviceId: appointment.serviceId.toString(),
      spaceOfServiceId: appointment.spaceOfServiceId.toString(),
      customerId: appointment.customerId.toString(),
    };
  }
}
