import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { FindServiceByNameUseCase } from './find-service-by-name';

import { makeService } from 'test/factories/make-service';
import { InMemoryServiceRepository } from 'test/repositories/in-memory-service-repository';

let inMemoryServiceRepository: InMemoryServiceRepository;
let sut: FindServiceByNameUseCase;

describe('Find Service By Name', () => {
  beforeEach(() => {
    inMemoryServiceRepository = new InMemoryServiceRepository();
    sut = new FindServiceByNameUseCase(inMemoryServiceRepository);
  });

  it('should be able to find a service by name', async () => {
    const newService = makeService({
      name: 'Test Service',
    });

    await inMemoryServiceRepository.create(newService);

    const result = await sut.execute({
      name: 'Test Service',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.service.name).toEqual('Test Service');
    }
  });

  it('should not be able to find a service with wrong name', async () => {
    const result = await sut.execute({
      name: 'non-existing-name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
