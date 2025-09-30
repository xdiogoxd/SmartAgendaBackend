import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { UserNotFoundError } from '../errors/user-not-found-error';
import { UpdateAppointmentUseCase } from './update-appointment';

import { makeAppointment } from 'test/factories/make-appointment';
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

import { faker } from '@faker-js/faker/.';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryCustomerRepository: InMemoryCustomerRepository;
let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let inMemoryServiceRepository: InMemoryServiceRepository;
let inMemorySpaceOfServiceRepository: InMemorySpaceOfServiceRepository;
let inMemoryAppointmentRepository: InMemoryAppointmentRepository;

let sut: UpdateAppointmentUseCase;

describe('Update Appointment', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository();
    inMemoryCustomerRepository = new InMemoryCustomerRepository();
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    inMemorySpaceOfServiceRepository = new InMemorySpaceOfServiceRepository();
    inMemoryServiceRepository = new InMemoryServiceRepository();
    sut = new UpdateAppointmentUseCase(
      inMemoryCustomerRepository,
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
    const customer = makeCustomer({
      organizationId: organization.id,
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
    await inMemoryCustomerRepository.create(customer);
    await inMemorySpaceOfServiceRepository.create(spaceOfService);
    await inMemoryServiceRepository.create(service);
    await inMemoryAppointmentRepository.create(appointment);

    const appointmentId = appointment.id.toString();

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      appointmentId,
      description: 'Appointment description updated',
      observations: 'Appointment observations updated',
      spaceOfServiceId: spaceOfService.id.toString(),
      serviceId: service.id.toString(),
      customerPhone: customer.phone,
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

  it('should not be able to update an appointment with invalid customer phone', async () => {
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
      organizationId: organization.id.toString(),
      appointmentId,
      description: 'Appointment description',
      observations: 'Appointment observations',
      spaceOfServiceId: spaceOfService.id.toString(),
      serviceId: service.id.toString(),
      customerPhone: customer.phone,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should not be able to update an appointment with invalid space of service id', async () => {
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

    const appointment = makeAppointment({
      organizationId: organization.id,
    });

    await inMemoryUserRepository.create(user);
    await inMemoryCustomerRepository.create(customer);
    await inMemoryOrganizationRepository.create(organization);
    await inMemoryServiceRepository.create(service);
    await inMemoryAppointmentRepository.create(appointment);

    const appointmentId = appointment.id.toString();

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      appointmentId,
      description: 'Appointment description',
      observations: 'Appointment observations',
      spaceOfServiceId: 'invalid-space-of-service-id',
      serviceId: service.id.toString(),
      customerPhone: customer.phone,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to update an appointment with invalid service id', async () => {
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
    const appointment = makeAppointment({
      organizationId: organization.id,
    });

    await inMemoryUserRepository.create(user);
    await inMemoryCustomerRepository.create(customer);
    await inMemoryOrganizationRepository.create(organization);
    await inMemorySpaceOfServiceRepository.create(spaceOfService);
    await inMemoryAppointmentRepository.create(appointment);

    const appointmentId = appointment.id.toString();

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      appointmentId,
      description: 'Appointment description',
      observations: 'Appointment observations',
      spaceOfServiceId: spaceOfService.id.toString(),
      serviceId: 'invalid-service-id',
      customerPhone: customer.phone,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
