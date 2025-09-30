import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { ListAllSpacesOfServiceByOrganizationUseCase } from './list-all-spaces-of-service-by-organization';

import { makeOrganization } from 'test/factories/make-organization';
import { makeSpaceOfService } from 'test/factories/make-space-of-service';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { InMemorySpaceOfServiceRepository } from 'test/repositories/in-memory-space-of-service-repository';

describe('List All SpaceOfServices Use Case', () => {
  let inMemorySpaceOfServiceRepository: InMemorySpaceOfServiceRepository;
  let inMemoryOrganizationRepository: InMemoryOrganizationRepository;

  let sut: ListAllSpacesOfServiceByOrganizationUseCase;

  beforeEach(() => {
    inMemorySpaceOfServiceRepository = new InMemorySpaceOfServiceRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    sut = new ListAllSpacesOfServiceByOrganizationUseCase(
      inMemorySpaceOfServiceRepository,
      inMemoryOrganizationRepository,
    );
  });

  it('should be able to list all spaceofservices', async () => {
    const organization = makeOrganization();

    await inMemoryOrganizationRepository.create(organization);

    await inMemorySpaceOfServiceRepository.create(
      makeSpaceOfService({
        organizationId: organization.id,
        name: 'SpaceOfService 1',
        description: 'Description 1',
      }),
    );

    await inMemorySpaceOfServiceRepository.create(
      makeSpaceOfService({
        organizationId: organization.id,
        name: 'SpaceOfService 2',
        description: 'Description 2',
      }),
    );

    await inMemorySpaceOfServiceRepository.create(
      makeSpaceOfService({
        organizationId: organization.id,
        name: 'SpaceOfService 3',
        description: 'Description 3',
      }),
    );

    await inMemorySpaceOfServiceRepository.create(
      makeSpaceOfService({
        organizationId: organization.id,
        name: 'SpaceOfService 4',
        description: 'Description 4',
      }),
    );

    await inMemorySpaceOfServiceRepository.create(
      makeSpaceOfService({
        organizationId: organization.id,
        name: 'SpaceOfService 5',
        description: 'Description 5',
      }),
    );

    const result = await sut.execute({
      organizationId: organization.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.spacesOfService).toHaveLength(5);
      expect(result.value.spacesOfService).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'SpaceOfService 1' }),
          expect.objectContaining({ name: 'SpaceOfService 2' }),
          expect.objectContaining({ name: 'SpaceOfService 3' }),
          expect.objectContaining({ name: 'SpaceOfService 4' }),
          expect.objectContaining({ name: 'SpaceOfService 5' }),
        ]),
      );
    }
  });

  it('should return an empty array when no spaceofservices are found', async () => {
    const organization = makeOrganization();

    await inMemoryOrganizationRepository.create(organization);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.spacesOfService).toHaveLength(0);
      expect(result.value.spacesOfService).toEqual([]);
    }
  });

  it('should not be able to list spaceofservices by organization id if organization does not exist', async () => {
    const result = await sut.execute({
      organizationId: 'non-existing-organization-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
  });
});
