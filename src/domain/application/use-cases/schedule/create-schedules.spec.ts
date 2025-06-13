import { CreateSchedulesUseCase } from './create-schedules';
import { MissingDayOnScheduleError } from '../errors/missing-day-on-schedule-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { InMemoryScheduleRepository } from 'test/repositories/in-memory-schedule-repository';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { makeOrganization } from 'test/factories/make-organization';

let inMemoryScheduleRepository: InMemoryScheduleRepository;
let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let sut: CreateSchedulesUseCase;

describe('Create Schedules', () => {
  beforeEach(() => {
    inMemoryScheduleRepository = new InMemoryScheduleRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    sut = new CreateSchedulesUseCase(
      inMemoryOrganizationRepository,
      inMemoryScheduleRepository,
    );
  });

  it('should be able to create new schedules', async () => {
    const organization = makeOrganization();
    await inMemoryOrganizationRepository.create(organization);

    const result = await sut.execute({
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
          startHour: '9',
          endHour: '17',
        },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.schedules).toHaveLength(2);
      expect(result.value.schedules[0]).toEqual(
        expect.objectContaining({
          weekDay: 'monday',
          startHour: 9,
          endHour: 17,
        }),
      );
    }
  });
  it('should not be able to create schedules for non-existing organization', async () => {
    const result = await sut.execute({
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

  it('should not be able to create schedules with missing day information', async () => {
    const organization = makeOrganization();
    await inMemoryOrganizationRepository.create(organization);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      day: [undefined as any],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(MissingDayOnScheduleError);
  });
});
