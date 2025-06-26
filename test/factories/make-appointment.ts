import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Appointment,
  AppointmentProps,
} from '@/domain/enterprise/entities/appointment';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaAppointmentMapper } from '@/infra/database/prisma/mappers/prisma-appointment.mapper';
import { Optional } from '@/core/types/optional';
import { convertAppointmentStringToEnum } from '@/domain/utils/convert-appointment-string-to-enum';

export function makeAppointment(
  override: Partial<AppointmentProps> = {},
  id?: UniqueEntityID,
) {
  const status = convertAppointmentStringToEnum('PENDING');

  const appointment = Appointment.create(
    {
      date: faker.date.future(),
      description: faker.lorem.paragraph(),
      observations: faker.lorem.paragraph(),
      status,
      createdAt: faker.date.recent(),
      organizationId: new UniqueEntityID(),
      serviceId: new UniqueEntityID(),
      spaceOfServiceId: new UniqueEntityID(),
      clientId: new UniqueEntityID(),
      ...override,
    },
    id,
  );
  return appointment;
}

@Injectable()
export class AppointmentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAppointment(
    data: Optional<
      AppointmentProps,
      | 'date'
      | 'description'
      | 'observations'
      | 'status'
      | 'createdAt'
      | 'updatedAt'
      | 'canceledAt'
      | 'finishedAt'
    >,
  ): Promise<Appointment> {
    const appointment = makeAppointment(data);

    await this.prisma.appointment.create({
      data: PrismaAppointmentMapper.toPrisma(appointment),
    });

    return appointment;
  }
}
