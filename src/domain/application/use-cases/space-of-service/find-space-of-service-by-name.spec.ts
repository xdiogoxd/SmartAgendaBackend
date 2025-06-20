import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { InMemorySpaceOfServiceRepository } from 'test/repositories/in-memory-space-of-service-repository';
import { makeSpaceOfService } from 'test/factories/make-space-of-service';
import { FindSpaceOfServiceByNameUseCase } from './find-space-of-service-name';

let inMemorySpaceOfServiceRepository: InMemorySpaceOfServiceRepository;
let sut: FindSpaceOfServiceByNameUseCase;

describe('Find SpaceOfService By Name', () => {
  beforeEach(() => {
    inMemorySpaceOfServiceRepository = new InMemorySpaceOfServiceRepository();
    sut = new FindSpaceOfServiceByNameUseCase(inMemorySpaceOfServiceRepository);
  });

  it('should be able to find a spaceofservice by name', async () => {
    const newSpaceOfService = makeSpaceOfService({
      name: 'spaceofservice-1',
    });

    await inMemorySpaceOfServiceRepository.create(newSpaceOfService);

    const result = await sut.execute({
      name: 'spaceofservice-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.spaceOfService.name).toEqual('spaceofservice-1');
    }
  });

  it('should not be able to find a spaceofservice with wrong id', async () => {
    const result = await sut.execute({
      name: 'non-existing-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
