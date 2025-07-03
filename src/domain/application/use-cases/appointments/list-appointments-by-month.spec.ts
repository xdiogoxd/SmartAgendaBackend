import { InMemoryAppointmentRepository } from 'test/repositories/in-memory-appointment-repository';

import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { InMemoryServiceRepository } from 'test/repositories/in-memory-service-repository';
import { InMemorySpaceOfServiceRepository } from 'test/repositories/in-memory-space-of-service-repository';
import { makeUser } from 'test/factories/make-user';
import { makeOrganization } from 'test/factories/make-organization';
import { makeSpaceOfService } from 'test/factories/make-space-of-service';
import { makeService } from 'test/factories/make-service';
import { faker } from '@faker-js/faker';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { ListAppointmentsByMonthUseCase } from './list-appointments-by-month';
import { addDays, getMonth, getYear, startOfMonth } from 'date-fns';
import { makeAppointment } from 'test/factories/make-appointment';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let inMemoryServiceRepository: InMemoryServiceRepository;
let inMemorySpaceOfServiceRepository: InMemorySpaceOfServiceRepository;
let inMemoryAppointmentRepository: InMemoryAppointmentRepository;

let sut: ListAppointmentsByMonthUseCase;

describe('List Appointments by Month', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository();
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    inMemorySpaceOfServiceRepository = new InMemorySpaceOfServiceRepository();
    inMemoryServiceRepository = new InMemoryServiceRepository();
    sut = new ListAppointmentsByMonthUseCase(
      inMemoryOrganizationRepository,
      inMemoryAppointmentRepository,
    );
  });

  it('should be able to list appointments by month', async () => {
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

    const baseDate = faker.date.future();

    const initialDate = startOfMonth(baseDate);

    const date1 = addDays(initialDate, 1);
    const date2 = addDays(initialDate, 2);
    const date3 = addDays(initialDate, 3);

    const appointment1 = makeAppointment({
      organizationId: organization.id,
      date: date1,
    });

    const appointment2 = makeAppointment({
      organizationId: organization.id,
      date: date2,
    });

    const appointment3 = makeAppointment({
      organizationId: organization.id,
      date: date3,
    });

    await inMemoryUserRepository.create(user);
    await inMemoryOrganizationRepository.create(organization);
    await inMemorySpaceOfServiceRepository.create(spaceOfService);
    await inMemoryServiceRepository.create(service);
    await inMemoryAppointmentRepository.create(appointment1);
    await inMemoryAppointmentRepository.create(appointment2);
    await inMemoryAppointmentRepository.create(appointment3);

    const organizationId = organization.id.toString();
    const month = getMonth(baseDate);
    const year = getYear(baseDate);

    const result = await sut.execute({
      organizationId,
      month,
      year,
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryAppointmentRepository.items).toHaveLength(3);
    expect(inMemoryAppointmentRepository.items[0].organizationId).toEqual(
      organization.id,
    );
  });

  it('should not be able to list appointments by month with invalid organization', async () => {
    const organizationId = 'invalid-organization-id';
    const month = faker.number.int({ min: 1, max: 12 });
    const year = faker.number.int({ min: 2024, max: 2025 });

    const result = await sut.execute({
      organizationId,
      month,
      year,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
  });
});
