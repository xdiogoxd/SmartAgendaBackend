import { InMemoryAppointmentRepository } from 'test/repositories/in-memory-appointment-repository';

import { RescheduleAppointmentUseCase } from './reschedule-appointment';
import { makeAppointment } from 'test/factories/make-appointment';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { AppointmentStatus } from '@/core/types/appointment-status-enum';
import { AppointmentStatusInvalidError } from '../errors/appointment-status-invalid-error';
import { AppointmentNotAvailableError } from '../errors/appointment-not-available-error';
import { faker } from '@faker-js/faker';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

let inMemoryAppointmentRepository: InMemoryAppointmentRepository;
let sut: RescheduleAppointmentUseCase;

describe('Reschedule Appointment', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository();
    sut = new RescheduleAppointmentUseCase(inMemoryAppointmentRepository);
  });

  it('should be able to reschedule a appointment', async () => {
    const appointment = makeAppointment();

    await inMemoryAppointmentRepository.create(appointment);

    const newDate = faker.date.future();

    newDate.setDate(newDate.getDate() + 2);

    const result = await sut.execute({
      appointmentId: appointment.id.toString(),
      date: newDate,
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryAppointmentRepository.items).toHaveLength(1);
  });

  it('should not be able to reschedule an appointment with invalid id', async () => {
    const result = await sut.execute({
      appointmentId: 'invalid-id',
      date: new Date(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to reschedule an appointment with status finished', async () => {
    const appointment = makeAppointment({
      status: AppointmentStatus.FINISHED,
    });

    await inMemoryAppointmentRepository.create(appointment);

    const result = await sut.execute({
      appointmentId: appointment.id.toString(),
      date: faker.date.future(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppointmentStatusInvalidError);
  });

  it('should not be able to reschedule an appointment with status canceled', async () => {
    const appointment = makeAppointment({
      status: AppointmentStatus.CANCELED,
    });

    await inMemoryAppointmentRepository.create(appointment);

    const result = await sut.execute({
      appointmentId: appointment.id.toString(),
      date: faker.date.future(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppointmentStatusInvalidError);
  });

  it('should not be able to reschedule an appointment with a date already taken', async () => {
    const date1 = faker.date.future();
    const date2 = faker.date.future();

    date2.setDate(date1.getDate() + 1);

    // Create two appointments with the same organizationId and spaceOfServiceId
    // but different dates
    const organizationId = 'same-org-id';
    const spaceOfServiceId = 'same-space-id';

    const appointment1 = makeAppointment({
      date: date1,
      organizationId: new UniqueEntityID(organizationId),
      spaceOfServiceId: new UniqueEntityID(spaceOfServiceId),
    });

    const appointment2 = makeAppointment({
      date: date2,
      organizationId: new UniqueEntityID(organizationId),
      spaceOfServiceId: new UniqueEntityID(spaceOfServiceId),
    });

    await inMemoryAppointmentRepository.create(appointment1);
    await inMemoryAppointmentRepository.create(appointment2);

    const result = await sut.execute({
      appointmentId: appointment2.id.toString(),
      date: date1,
    });

    console.log(result.value);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppointmentNotAvailableError);
  });
});
