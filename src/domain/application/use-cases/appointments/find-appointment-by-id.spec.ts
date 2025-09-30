import { AppointmentDatesInvalidError } from '../errors/appointment-dates-invalid-error';
import { AppointmentNotFoundError } from '../errors/appointment-not-found-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { FindAppointmentByIdUseCase } from './find-appointment-by-id';

import { makeAppointment } from 'test/factories/make-appointment';
import { makeOrganization } from 'test/factories/make-organization';
import { makeService } from 'test/factories/make-service';
import { makeSpaceOfService } from 'test/factories/make-space-of-service';
import { makeUser } from 'test/factories/make-user';
import { InMemoryAppointmentRepository } from 'test/repositories/in-memory-appointment-repository';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { InMemoryServiceRepository } from 'test/repositories/in-memory-service-repository';
import { InMemorySpaceOfServiceRepository } from 'test/repositories/in-memory-space-of-service-repository';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';

import { faker } from '@faker-js/faker';
import { addDays, endOfMonth, startOfMonth } from 'date-fns';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let inMemoryServiceRepository: InMemoryServiceRepository;
let inMemorySpaceOfServiceRepository: InMemorySpaceOfServiceRepository;
let inMemoryAppointmentRepository: InMemoryAppointmentRepository;
let sut: FindAppointmentByIdUseCase;

describe('Find Appointment by id', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository();
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    inMemorySpaceOfServiceRepository = new InMemorySpaceOfServiceRepository();
    inMemoryServiceRepository = new InMemoryServiceRepository();
    sut = new FindAppointmentByIdUseCase(
      inMemoryOrganizationRepository,
      inMemoryAppointmentRepository,
    );
  });

  it('should be able to find an appointment by id', async () => {
    const user = makeUser();
    const organization = makeOrganization({
      ownerId: user.id,
    });
    const spaceOfService = makeSpaceOfService({
      organizationId: organization.id,
    });
    const service = makeService({
      organizationId: organization.id,
    });

    const appointment = makeAppointment({
      organizationId: organization.id,
    });

    await inMemoryUserRepository.create(user);
    await inMemoryOrganizationRepository.create(organization);
    await inMemorySpaceOfServiceRepository.create(spaceOfService);
    await inMemoryServiceRepository.create(service);
    await inMemoryAppointmentRepository.create(appointment);

    const organizationId = organization.id.toString();
    const appointmentId = appointment.id.toString();

    const result = await sut.execute({
      organizationId,
      appointmentId,
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryAppointmentRepository.items).toHaveLength(1);
    expect(inMemoryAppointmentRepository.items[0].id).toEqual(appointment.id);
  });

  it('should not find a appointment for an unregistered id', async () => {
    const organization = makeOrganization();

    await inMemoryOrganizationRepository.create(organization);

    const organizationId = organization.id.toString();

    const appointement = makeAppointment();

    const appointmentId = appointement.id.toString();

    const result = await sut.execute({
      organizationId,
      appointmentId,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppointmentNotFoundError);
  });

  it('should not be able to list appointments by date range with invalid organization id', async () => {
    const organizationId = 'invalid-organization-id';

    const appointement = makeAppointment();

    const appointmentId = appointement.id.toString();

    const result = await sut.execute({
      organizationId,
      appointmentId,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
  });

  it('should not be able to find an appointment with an organization that doesnt match', async () => {
    const user = makeUser();
    const organization1 = makeOrganization({
      ownerId: user.id,
    });

    const organization2 = makeOrganization();

    const spaceOfService = makeSpaceOfService({
      organizationId: organization1.id,
    });
    const service = makeService({
      organizationId: organization1.id,
    });

    const appointment = makeAppointment({
      organizationId: organization1.id,
    });

    await inMemoryUserRepository.create(user);
    await inMemoryOrganizationRepository.create(organization1);
    await inMemoryOrganizationRepository.create(organization2);
    await inMemorySpaceOfServiceRepository.create(spaceOfService);
    await inMemoryServiceRepository.create(service);
    await inMemoryAppointmentRepository.create(appointment);

    const organizationId = organization2.id.toString();
    const appointmentId = appointment.id.toString();

    const result = await sut.execute({
      organizationId,
      appointmentId,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppointmentNotFoundError);
  });
});
