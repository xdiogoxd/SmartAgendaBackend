import { UniqueEntityID } from '@/core/entities/unique-entity-id';

import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { FindSpaceOfServiceByIdUseCase } from './find-space-of-service-by-id';

import { makeOrganization } from 'test/factories/make-organization';
import { makeSpaceOfService } from 'test/factories/make-space-of-service';
import { InMemorySpaceOfServiceRepository } from 'test/repositories/in-memory-space-of-service-repository';

let inMemorySpaceOfServiceRepository: InMemorySpaceOfServiceRepository;
let sut: FindSpaceOfServiceByIdUseCase;

describe('Find SpaceOfService By Id', () => {
  beforeEach(() => {
    inMemorySpaceOfServiceRepository = new InMemorySpaceOfServiceRepository();
    sut = new FindSpaceOfServiceByIdUseCase(inMemorySpaceOfServiceRepository);
  });

  it('should be able to find a spaceofservice by id', async () => {
    const organization = makeOrganization();
    const newSpaceOfService = makeSpaceOfService(
      {
        organizationId: organization.id,
      },
      new UniqueEntityID('spaceofservice-1'),
    );

    await inMemorySpaceOfServiceRepository.create(newSpaceOfService);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      id: 'spaceofservice-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.spaceOfService.id.toString()).toEqual(
        'spaceofservice-1',
      );
    }
  });

  it('should not be able to find a spaceofservice with wrong id', async () => {
    const organization = makeOrganization();
    const result = await sut.execute({
      organizationId: organization.id.toString(),
      id: 'non-existing-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
