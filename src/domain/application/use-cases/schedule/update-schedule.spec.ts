import { UpdateSchedulesUseCase } from './update-schedule';
import { MissingDayOnScheduleError } from '../errors/missing-day-on-schedule-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { InMemoryScheduleRepository } from 'test/repositories/in-memory-schedule-repository';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { makeOrganization } from 'test/factories/make-organization';
import { makeSchedule } from 'test/factories/make-schedule';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

let inMemoryScheduleRepository: InMemoryScheduleRepository;
let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let sut: UpdateSchedulesUseCase;

describe('Update Schedules', () => {
  beforeEach(() => {
    inMemoryScheduleRepository = new InMemoryScheduleRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    sut = new UpdateSchedulesUseCase(
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
      scheduleId: schedule[0].id.toString(),
      organizationId: organization.id.toString(),
      day: [
        {
          weekDay: 'monday',
          startHour: '9',
          endHour: '17',
        },
        {
          weekDay: 'tuesday',
          startHour: '9',
          endHour: '17',
        },
        {
          weekDay: 'wednesday',
          startHour: '9',
          endHour: '17',
        },
        {
          weekDay: 'thursday',
          startHour: '9',
          endHour: '17',
        },
        {
          weekDay: 'friday',
          startHour: '9',
          endHour: '17',
        },
        {
          weekDay: 'saturday',
          startHour: '9',
          endHour: '17',
        },
        {
          weekDay: 'sunday',
          startHour: '0',
          endHour: '0',
        },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.schedule.schedules[0]).toEqual(
        expect.objectContaining({
          weekDay: 'monday',
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
      scheduleId: schedule[0].id.toString(),
      organizationId: 'non-existing-id',
      day: [
        {
          weekDay: 'monday',
          startHour: '9',
          endHour: '17',
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
      scheduleId: 'non-existing-id',
      organizationId: organization.id.toString(),
      day: [
        {
          weekDay: 'monday',
          startHour: '9',
          endHour: '17',
        },
      ],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to update schedules with missing day information', async () => {
    const organization = makeOrganization();
    await inMemoryOrganizationRepository.create(organization);

    const schedule = makeSchedule();
    for (let i = 0; i < schedule.length; i++) {
      await inMemoryScheduleRepository.create(schedule[i]);
    }

    const result = await sut.execute({
      scheduleId: schedule[0].id.toString(),
      organizationId: organization.id.toString(),
      day: [{ weekDay: 'monday', startHour: '9', endHour: '17' }],
    });

    console.log(result.value);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(MissingDayOnScheduleError);
  });
});
