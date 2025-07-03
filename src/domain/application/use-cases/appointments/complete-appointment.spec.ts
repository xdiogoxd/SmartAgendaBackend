import { InMemoryAppointmentRepository } from 'test/repositories/in-memory-appointment-repository';

import { CompleteAppointmentUseCase } from './complete-appointment';
import { makeAppointment } from 'test/factories/make-appointment';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { AppointmentStatus } from '@/core/types/appointment-status-enum';
import { AppointmentStatusInvalidError } from '../errors/appointment-status-invalid-error';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { makeOrganization } from 'test/factories/make-organization';

let inMemoryAppointmentRepository: InMemoryAppointmentRepository;
let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let sut: CompleteAppointmentUseCase;

describe('Complete Appointment', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    sut = new CompleteAppointmentUseCase(inMemoryAppointmentRepository);
  });

  it('should be able to complete a appointment', async () => {
    const organization = makeOrganization();

    await inMemoryOrganizationRepository.items.push(organization);

    const appointment = makeAppointment({
      organizationId: organization.id,
    });

    await inMemoryAppointmentRepository.create(appointment);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      appointmentId: appointment.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryAppointmentRepository.items).toHaveLength(1);
    expect(inMemoryAppointmentRepository.items[0].finishedAt).toEqual(
      expect.any(Date),
    );
  });

  it('should not be able to complete an appointment with invalid id', async () => {
    const organization = makeOrganization();

    await inMemoryOrganizationRepository.items.push(organization);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      appointmentId: 'invalid-id',
    });

    console.log(result.value);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to complete an appointment with status finished', async () => {
    const organization = makeOrganization();

    await inMemoryOrganizationRepository.items.push(organization);

    const appointment = makeAppointment({
      organizationId: organization.id,
      status: AppointmentStatus.FINISHED,
    });

    await inMemoryAppointmentRepository.create(appointment);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      appointmentId: appointment.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppointmentStatusInvalidError);
  });

  it('should not be able to complete an appointment with status canceled', async () => {
    const organization = makeOrganization();

    await inMemoryOrganizationRepository.items.push(organization);

    const appointment = makeAppointment({
      organizationId: organization.id,
      status: AppointmentStatus.CANCELED,
    });

    await inMemoryAppointmentRepository.create(appointment);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      appointmentId: appointment.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppointmentStatusInvalidError);
  });
});
