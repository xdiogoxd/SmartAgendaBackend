import { CustomerNotFoundError } from '../errors/customer-not-found-error';
import { InvalidAppointmentDateError } from '../errors/invalid-appointment-date-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { CreateAppointmentUseCase } from './create-appointment';

import { makeCustomer } from 'test/factories/make-customer';
import { makeOrganization } from 'test/factories/make-organization';
import { makeService } from 'test/factories/make-service';
import { makeSpaceOfService } from 'test/factories/make-space-of-service';
import { makeUser } from 'test/factories/make-user';
import { InMemoryAppointmentRepository } from 'test/repositories/in-memory-appointment-repository';
import { InMemoryCustomerRepository } from 'test/repositories/in-memory-customer-repository';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { InMemoryServiceRepository } from 'test/repositories/in-memory-service-repository';
import { InMemorySpaceOfServiceRepository } from 'test/repositories/in-memory-space-of-service-repository';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';

import { faker } from '@faker-js/faker';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryCustomerRepository: InMemoryCustomerRepository;
let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let inMemoryServiceRepository: InMemoryServiceRepository;
let inMemorySpaceOfServiceRepository: InMemorySpaceOfServiceRepository;
let inMemoryAppointmentRepository: InMemoryAppointmentRepository;

let sut: CreateAppointmentUseCase;

describe('Create Appointment', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository();
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryCustomerRepository = new InMemoryCustomerRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    inMemorySpaceOfServiceRepository = new InMemorySpaceOfServiceRepository();
    inMemoryServiceRepository = new InMemoryServiceRepository();
    sut = new CreateAppointmentUseCase(
      inMemoryCustomerRepository,
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

    const customer = makeCustomer({
      organizationId: organization.id,
    });
    const spaceOfService = makeSpaceOfService({
      organizationId: organization.id,
    });
    const service = makeService({
      organizationId: organization.id,
    });

    await inMemoryUserRepository.create(user);
    await inMemoryCustomerRepository.create(customer);
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
      customerPhone: customer.phone,
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
    const customer = makeCustomer({
      organizationId: organization.id,
    });
    const spaceOfService = makeSpaceOfService({
      organizationId: organization.id,
    });
    const service = makeService({
      organizationId: organization.id,
    });

    await inMemoryUserRepository.create(user);
    await inMemoryCustomerRepository.create(customer);
    await inMemorySpaceOfServiceRepository.create(spaceOfService);
    await inMemoryServiceRepository.create(service);

    const result = await sut.execute({
      date: faker.date.future(),
      description: 'Appointment description',
      observations: 'Appointment observations',
      organizationId: 'invalid-organization-id',
      spaceOfServiceId: spaceOfService.id.toString(),
      serviceId: service.id.toString(),
      customerPhone: customer.phone,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
  });

  it('should not be able to create an appointment with invalid customer phone', async () => {
    const user = makeUser();
    const organization = makeOrganization({
      ownerId: user.id,
    });
    const customer = makeCustomer({
      organizationId: organization.id,
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
      customerPhone: customer.phone,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CustomerNotFoundError);
  });

  it('should not be able to create an appointment with invalid space of service id', async () => {
    const user = makeUser();
    const organization = makeOrganization({
      ownerId: user.id,
    });
    const customer = makeCustomer({
      organizationId: organization.id,
    });
    const service = makeService({
      organizationId: organization.id,
    });

    await inMemoryUserRepository.create(user);
    await inMemoryCustomerRepository.create(customer);
    await inMemoryOrganizationRepository.create(organization);
    await inMemoryServiceRepository.create(service);

    const result = await sut.execute({
      date: faker.date.future(),
      description: 'Appointment description',
      observations: 'Appointment observations',
      organizationId: organization.id.toString(),
      spaceOfServiceId: 'invalid-space-of-service-id',
      serviceId: service.id.toString(),
      customerPhone: customer.phone,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to create an appointment with invalid service id', async () => {
    const user = makeUser();
    const organization = makeOrganization({
      ownerId: user.id,
    });
    const customer = makeCustomer({
      organizationId: organization.id,
    });
    const spaceOfService = makeSpaceOfService({
      organizationId: organization.id,
    });

    await inMemoryUserRepository.create(user);
    await inMemoryOrganizationRepository.create(organization);
    await inMemoryCustomerRepository.create(customer);
    await inMemorySpaceOfServiceRepository.create(spaceOfService);

    const result = await sut.execute({
      date: faker.date.future(),
      description: 'Appointment description',
      observations: 'Appointment observations',
      organizationId: organization.id.toString(),
      spaceOfServiceId: spaceOfService.id.toString(),
      serviceId: 'invalid-service-id',
      customerPhone: customer.phone,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to create an appointment with date in the past', async () => {
    const user = makeUser();
    const organization = makeOrganization({
      ownerId: user.id,
    });
    const customer = makeCustomer({
      organizationId: organization.id,
    });
    const spaceOfService = makeSpaceOfService({
      organizationId: organization.id,
    });
    const service = makeService({
      organizationId: organization.id,
    });

    await inMemoryUserRepository.create(user);
    await inMemoryOrganizationRepository.create(organization);
    await inMemoryCustomerRepository.create(customer);
    await inMemorySpaceOfServiceRepository.create(spaceOfService);
    await inMemoryServiceRepository.create(service);

    const result = await sut.execute({
      date: faker.date.past(),
      description: 'Appointment description',
      observations: 'Appointment observations',
      organizationId: organization.id.toString(),
      spaceOfServiceId: spaceOfService.id.toString(),
      serviceId: service.id.toString(),
      customerPhone: customer.phone,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidAppointmentDateError);
  });
});
