import { InMemoryServiceRepository } from 'test/repositories/in-memory-service-repository';
import { FindServiceByIdUseCase } from './find-service-by-id';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { makeService } from 'test/factories/make-service';

let inMemoryServiceRepository: InMemoryServiceRepository;
let sut: FindServiceByIdUseCase;

describe('Find Service By Id', () => {
  beforeEach(() => {
    inMemoryServiceRepository = new InMemoryServiceRepository();
    sut = new FindServiceByIdUseCase(inMemoryServiceRepository);
  });

  it('should be able to find a service by id', async () => {
    const newService = makeService({}, new UniqueEntityID('service-1'));

    await inMemoryServiceRepository.create(newService);

    const result = await sut.execute({
      id: 'service-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.service.id).toEqual('service-1');
    }
  });

  it('should not be able to find a service with wrong id', async () => {
    const result = await sut.execute({
      id: 'non-existing-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
