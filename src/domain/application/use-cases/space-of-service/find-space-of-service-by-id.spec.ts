import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { InMemorySpaceOfServiceRepository } from 'test/repositories/in-memory-space-of-service-repository';
import { FindSpaceOfServiceByIdUseCase } from './find-space-of-service-by-id';
import { makeSpaceOfService } from 'test/factories/make-space-of-service';

let inMemorySpaceOfServiceRepository: InMemorySpaceOfServiceRepository;
let sut: FindSpaceOfServiceByIdUseCase;

describe('Find SpaceOfService By Id', () => {
  beforeEach(() => {
    inMemorySpaceOfServiceRepository = new InMemorySpaceOfServiceRepository();
    sut = new FindSpaceOfServiceByIdUseCase(inMemorySpaceOfServiceRepository);
  });

  it('should be able to find a spaceofservice by id', async () => {
    const newSpaceOfService = makeSpaceOfService(
      {},
      new UniqueEntityID('spaceofservice-1'),
    );

    await inMemorySpaceOfServiceRepository.create(newSpaceOfService);

    const result = await sut.execute({
      id: 'spaceofservice-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.spaceOfService.id).toEqual('spaceofservice-1');
    }
  });

  it('should not be able to find a spaceofservice with wrong id', async () => {
    const result = await sut.execute({
      id: 'non-existing-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
