import { AppointmentStatus } from '@/core/types/appointment-status-enum';

import { AppointmentStatusInvalidError } from '../errors/appointment-status-invalid-error';
import { DeleteAppointmentUseCase } from './delete-appointment';

import { makeAppointment } from 'test/factories/make-appointment';
import { makeOrganization } from 'test/factories/make-organization';
import { InMemoryAppointmentRepository } from 'test/repositories/in-memory-appointment-repository';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';

let inMemoryAppointmentRepository: InMemoryAppointmentRepository;
let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let sut: DeleteAppointmentUseCase;

describe('Delete Appointment', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    sut = new DeleteAppointmentUseCase(inMemoryAppointmentRepository);
  });

  it('should be able to delete a appointment', async () => {
    const organization = makeOrganization();
    inMemoryOrganizationRepository.items.push(organization);
    const appointment = makeAppointment({
      organizationId: organization.id,
    });

    await inMemoryAppointmentRepository.create(appointment);

    const result = await sut.execute({
      appointmentId: appointment.id.toString(),
      organizationId: organization.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryAppointmentRepository.items).toHaveLength(0);
  });

  it('should not be able to delete an completed appointment', async () => {
    const organization = makeOrganization();
    inMemoryOrganizationRepository.items.push(organization);
    const appointment = makeAppointment({
      status: AppointmentStatus.FINISHED,
      organizationId: organization.id,
    });

    await inMemoryAppointmentRepository.create(appointment);

    const result = await sut.execute({
      appointmentId: appointment.id.toString(),
      organizationId: organization.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppointmentStatusInvalidError);
  });
});
