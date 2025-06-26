import { InMemoryAppointmentRepository } from 'test/repositories/in-memory-appointment-repository';

import { AppointmentStatusInvalidError } from '../errors/appointment-status-invalid-error';
import { DeleteAppointmentUseCase } from './delete-appointment';
import { makeAppointment } from 'test/factories/make-appointment';
import { AppointmentStatus } from '@/core/types/appointment-status-enum';

let inMemoryAppointmentRepository: InMemoryAppointmentRepository;

let sut: DeleteAppointmentUseCase;

describe('Delete Appointment', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository();
    sut = new DeleteAppointmentUseCase(inMemoryAppointmentRepository);
  });

  it('should be able to delete a appointment', async () => {
    const appointment = makeAppointment();

    await inMemoryAppointmentRepository.create(appointment);

    const result = await sut.execute({
      appointmentId: appointment.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryAppointmentRepository.items).toHaveLength(0);
  });

  it('should not be able to delete an completed appointment', async () => {
    const appointment = makeAppointment({
      status: AppointmentStatus.FINISHED,
    });

    await inMemoryAppointmentRepository.create(appointment);

    const result = await sut.execute({
      appointmentId: appointment.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppointmentStatusInvalidError);
  });
});
