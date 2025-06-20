import { UpdateScheduleUseCase } from './update-schedule';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { InMemoryScheduleRepository } from 'test/repositories/in-memory-schedule-repository';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { makeOrganization } from 'test/factories/make-organization';
import { makeSchedule } from 'test/factories/make-schedule';

let inMemoryScheduleRepository: InMemoryScheduleRepository;
let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let sut: UpdateScheduleUseCase;

describe('Update Schedules', () => {
  beforeEach(() => {
    inMemoryScheduleRepository = new InMemoryScheduleRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    sut = new UpdateScheduleUseCase(
      inMemoryOrganizationRepository,
      inMemoryScheduleRepository,
    );
  });

  it('should be able to update schedules', async () => {
    const organization = makeOrganization();
    await inMemoryOrganizationRepository.create(organization);

    const schedule = makeSchedule({
      organizationId: organization.id,
    });
    for (let i = 0; i < schedule.length; i++) {
      await inMemoryScheduleRepository.create(schedule[i]);
    }

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      days: [
        {
          weekDay: 0,
          startHour: 9,
          endHour: 17,
        },
        {
          weekDay: 1,
          startHour: 9,
          endHour: 17,
        },
        {
          weekDay: 2,
          startHour: 9,
          endHour: 17,
        },
        {
          weekDay: 3,
          startHour: 9,
          endHour: 17,
        },
        {
          weekDay: 4,
          startHour: 9,
          endHour: 17,
        },
        {
          weekDay: 5,
          startHour: 9,
          endHour: 17,
        },
        {
          weekDay: 6,
          startHour: 9,
          endHour: 17,
        },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.schedule.schedules[0]).toEqual(
        expect.objectContaining({
          weekDay: 0,
          startHour: 9,
          endHour: 17,
        }),
      );
    }
  });

  it('should not be able to update schedules for non-existing organization', async () => {
    const schedule = makeSchedule();
    for (let i = 0; i < schedule.length; i++) {
      await inMemoryScheduleRepository.create(schedule[i]);
    }

    const result = await sut.execute({
      organizationId: 'non-existing-id',
      days: [
        {
          weekDay: 0,
          startHour: 9,
          endHour: 17,
        },
      ],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
  });

  it('should not be able to update non-existing schedule', async () => {
    const organization = makeOrganization();
    await inMemoryOrganizationRepository.create(organization);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      days: [
        {
          weekDay: 0,
          startHour: 9,
          endHour: 17,
        },
      ],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
