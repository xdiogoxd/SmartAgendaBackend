import { InMemoryAppointmentRepository } from 'test/repositories/in-memory-appointment-repository';

import { UpdateAppointmentUseCase } from './update-appointment';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { InMemoryServiceRepository } from 'test/repositories/in-memory-service-repository';
import { InMemorySpaceOfServiceRepository } from 'test/repositories/in-memory-space-of-service-repository';
import { makeUser } from 'test/factories/make-user';
import { makeOrganization } from 'test/factories/make-organization';
import { makeSpaceOfService } from 'test/factories/make-space-of-service';
import { makeService } from 'test/factories/make-service';
import { faker } from '@faker-js/faker';
import { UserNotFoundError } from '../errors/user-not-found-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { InvalidAppointmentDateError } from '../errors/invalid-appointment-date-error';
import { makeAppointment } from 'test/factories/make-appointment';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let inMemoryServiceRepository: InMemoryServiceRepository;
let inMemorySpaceOfServiceRepository: InMemorySpaceOfServiceRepository;
let inMemoryAppointmentRepository: InMemoryAppointmentRepository;

let sut: UpdateAppointmentUseCase;

describe('Update Appointment', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository();
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    inMemorySpaceOfServiceRepository = new InMemorySpaceOfServiceRepository();
    inMemoryServiceRepository = new InMemoryServiceRepository();
    sut = new UpdateAppointmentUseCase(
      inMemoryUserRepository,
      inMemorySpaceOfServiceRepository,
      inMemoryServiceRepository,
      inMemoryAppointmentRepository,
    );
  });

  it('should be able to update a appointment', async () => {
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

    const appointmentId = appointment.id.toString();

    const result = await sut.execute({
      appointmentId,
      description: 'Appointment description updated',
      observations: 'Appointment observations updated',
      spaceOfServiceId: spaceOfService.id.toString(),
      serviceId: service.id.toString(),
      clientId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryAppointmentRepository.items).toHaveLength(1);
    expect(inMemoryAppointmentRepository.items[0].description).toEqual(
      'Appointment description updated',
    );
    expect(inMemoryAppointmentRepository.items[0].observations).toEqual(
      'Appointment observations updated',
    );
  });

  it('should not be able to update an appointment with invalid client id', async () => {
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

    const appointmentId = appointment.id.toString();

    const result = await sut.execute({
      appointmentId,
      description: 'Appointment description',
      observations: 'Appointment observations',
      spaceOfServiceId: spaceOfService.id.toString(),
      serviceId: service.id.toString(),
      clientId: 'invalid-client-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should not be able to update an appointment with invalid space of service id', async () => {
    const user = makeUser();
    const organization = makeOrganization({
      ownerId: user.id,
    });
    const service = makeService({
      organizationId: organization.id,
    });

    const appointment = makeAppointment({
      organizationId: organization.id,
    });

    await inMemoryUserRepository.create(user);
    await inMemoryOrganizationRepository.create(organization);
    await inMemoryServiceRepository.create(service);
    await inMemoryAppointmentRepository.create(appointment);

    const appointmentId = appointment.id.toString();

    const result = await sut.execute({
      appointmentId,
      description: 'Appointment description',
      observations: 'Appointment observations',
      spaceOfServiceId: 'invalid-space-of-service-id',
      serviceId: service.id.toString(),
      clientId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to update an appointment with invalid service id', async () => {
    const user = makeUser();
    const organization = makeOrganization({
      ownerId: user.id,
    });
    const spaceOfService = makeSpaceOfService({
      organizationId: organization.id,
    });
    const appointment = makeAppointment({
      organizationId: organization.id,
    });

    await inMemoryUserRepository.create(user);
    await inMemoryOrganizationRepository.create(organization);
    await inMemorySpaceOfServiceRepository.create(spaceOfService);
    await inMemoryAppointmentRepository.create(appointment);

    const appointmentId = appointment.id.toString();

    const result = await sut.execute({
      appointmentId,
      description: 'Appointment description',
      observations: 'Appointment observations',
      spaceOfServiceId: spaceOfService.id.toString(),
      serviceId: 'invalid-service-id',
      clientId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
