import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { ListAllServicesByOrganizationUseCase } from './list-all-services-by-organization';

import { makeOrganization } from 'test/factories/make-organization';
import { makeService } from 'test/factories/make-service';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { InMemoryServiceRepository } from 'test/repositories/in-memory-service-repository';

describe('List All Services Use Case', () => {
  let inMemoryServiceRepository: InMemoryServiceRepository;
  let inMemoryOrganizationRepository: InMemoryOrganizationRepository;

  let sut: ListAllServicesByOrganizationUseCase;

  beforeEach(() => {
    inMemoryServiceRepository = new InMemoryServiceRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    sut = new ListAllServicesByOrganizationUseCase(
      inMemoryServiceRepository,
      inMemoryOrganizationRepository,
    );
  });

  it('should be able to list all services', async () => {
    const organization = makeOrganization();

    await inMemoryOrganizationRepository.create(organization);

    await inMemoryServiceRepository.create(
      makeService({
        organizationId: organization.id,
        name: 'Service 1',
        description: 'Description 1',
        price: 100,
        duration: 60,
      }),
    );

    await inMemoryServiceRepository.create(
      makeService({
        organizationId: organization.id,
        name: 'Service 2',
        description: 'Description 2',
        price: 200,
        duration: 90,
      }),
    );

    await inMemoryServiceRepository.create(
      makeService({
        organizationId: organization.id,
        name: 'Service 3',
        description: 'Description 3',
        price: 300,
        duration: 120,
      }),
    );

    await inMemoryServiceRepository.create(
      makeService({
        organizationId: organization.id,
        name: 'Service 4',
        description: 'Description 4',
        price: 400,
        duration: 150,
      }),
    );

    await inMemoryServiceRepository.create(
      makeService({
        organizationId: organization.id,
        name: 'Service 5',
        description: 'Description 5',
        price: 500,
        duration: 180,
      }),
    );

    const result = await sut.execute({
      organizationId: organization.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.services).toHaveLength(5);
      expect(result.value.services).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Service 1' }),
          expect.objectContaining({ name: 'Service 2' }),
          expect.objectContaining({ name: 'Service 3' }),
          expect.objectContaining({ name: 'Service 4' }),
          expect.objectContaining({ name: 'Service 5' }),
        ]),
      );
    }
  });

  it('should return an empty array when no services are found', async () => {
    const organization = makeOrganization();

    await inMemoryOrganizationRepository.create(organization);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.services).toHaveLength(0);
      expect(result.value.services).toEqual([]);
    }
  });

  it('should not be able to list services by organization id if organization does not exist', async () => {
    const result = await sut.execute({
      organizationId: 'non-existing-organization-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
  });
});
