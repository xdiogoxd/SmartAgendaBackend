import { InMemoryAppointmentRepository } from 'test/repositories/in-memory-appointment-repository';

import { CreateAppointmentUseCase } from './create-appointment';
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

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let inMemoryServiceRepository: InMemoryServiceRepository;
let inMemorySpaceOfServiceRepository: InMemorySpaceOfServiceRepository;
let inMemoryAppointmentRepository: InMemoryAppointmentRepository;

let sut: CreateAppointmentUseCase;

describe('Create Appointment', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository();
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    inMemorySpaceOfServiceRepository = new InMemorySpaceOfServiceRepository();
    inMemoryServiceRepository = new InMemoryServiceRepository();
    sut = new CreateAppointmentUseCase(
      inMemoryUserRepository,
      inMemoryOrganizationRepository,
      inMemorySpaceOfServiceRepository,
      inMemoryServiceRepository,
      inMemoryAppointmentRepository,
    );
  });

  it('should be able to create a appointment', async () => {
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

    await inMemoryUserRepository.create(user);
    await inMemoryOrganizationRepository.create(organization);
    await inMemorySpaceOfServiceRepository.create(spaceOfService);
    await inMemoryServiceRepository.create(service);

    const result = await sut.execute({
      date: faker.date.future(),
      description: 'Appointment description',
      observations: 'Appointment observations',
      organizationId: organization.id.toString(),
      spaceOfServiceId: spaceOfService.id.toString(),
      serviceId: service.id.toString(),
      clientId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryAppointmentRepository.items).toHaveLength(1);
    expect(inMemoryAppointmentRepository.items[0].organizationId).toEqual(
      organization.id,
    );
  });

  it('should not be able to create an appointment with invalid organization id', async () => {
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

    await inMemoryUserRepository.create(user);
    await inMemorySpaceOfServiceRepository.create(spaceOfService);
    await inMemoryServiceRepository.create(service);

    const result = await sut.execute({
      date: faker.date.future(),
      description: 'Appointment description',
      observations: 'Appointment observations',
      organizationId: 'invalid-organization-id',
      spaceOfServiceId: spaceOfService.id.toString(),
      serviceId: service.id.toString(),
      clientId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
  });

  it('should not be able to create an appointment with invalid client id', async () => {
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

    await inMemoryUserRepository.create(user);
    await inMemoryOrganizationRepository.create(organization);
    await inMemorySpaceOfServiceRepository.create(spaceOfService);
    await inMemoryServiceRepository.create(service);

    const result = await sut.execute({
      date: faker.date.future(),
      description: 'Appointment description',
      observations: 'Appointment observations',
      organizationId: organization.id.toString(),
      spaceOfServiceId: spaceOfService.id.toString(),
      serviceId: service.id.toString(),
      clientId: 'invalid-client-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should not be able to create an appointment with invalid space of service id', async () => {
    const user = makeUser();
    const organization = makeOrganization({
      ownerId: user.id,
    });
    const service = makeService({
      organizationId: organization.id,
    });

    await inMemoryUserRepository.create(user);
    await inMemoryOrganizationRepository.create(organization);
    await inMemoryServiceRepository.create(service);

    const result = await sut.execute({
      date: faker.date.future(),
      description: 'Appointment description',
      observations: 'Appointment observations',
      organizationId: organization.id.toString(),
      spaceOfServiceId: 'invalid-space-of-service-id',
      serviceId: service.id.toString(),
      clientId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to create an appointment with invalid service id', async () => {
    const user = makeUser();
    const organization = makeOrganization({
      ownerId: user.id,
    });
    const spaceOfService = makeSpaceOfService({
      organizationId: organization.id,
    });

    await inMemoryUserRepository.create(user);
    await inMemoryOrganizationRepository.create(organization);
    await inMemorySpaceOfServiceRepository.create(spaceOfService);

    const result = await sut.execute({
      date: faker.date.future(),
      description: 'Appointment description',
      observations: 'Appointment observations',
      organizationId: organization.id.toString(),
      spaceOfServiceId: spaceOfService.id.toString(),
      serviceId: 'invalid-service-id',
      clientId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to create an appointment with date in the past', async () => {
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

    await inMemoryUserRepository.create(user);
    await inMemoryOrganizationRepository.create(organization);
    await inMemorySpaceOfServiceRepository.create(spaceOfService);
    await inMemoryServiceRepository.create(service);

    const result = await sut.execute({
      date: faker.date.past(),
      description: 'Appointment description',
      observations: 'Appointment observations',
      organizationId: organization.id.toString(),
      spaceOfServiceId: spaceOfService.id.toString(),
      serviceId: service.id.toString(),
      clientId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidAppointmentDateError);
  });
});
