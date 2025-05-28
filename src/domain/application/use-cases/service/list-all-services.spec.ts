import { InMemoryServiceRepository } from 'test/repositories/in-memory-service-repository';
import { ListAllServicesUseCase } from './list-all-services';
import { makeService } from 'test/factories/make-service';

describe('List All Services Use Case', () => {
  let inMemoryServiceRepository: InMemoryServiceRepository;
  let sut: ListAllServicesUseCase;

  beforeEach(() => {
    inMemoryServiceRepository = new InMemoryServiceRepository();
    sut = new ListAllServicesUseCase(inMemoryServiceRepository);
  });

  it('should be able to list all services', async () => {
    await inMemoryServiceRepository.create(
      makeService({
        name: 'Service 1',
        description: 'Description 1',
        price: 100,
        duration: 60,
      }),
    );

    await inMemoryServiceRepository.create(
      makeService({
        name: 'Service 2',
        description: 'Description 2',
        price: 200,
        duration: 90,
      }),
    );

    await inMemoryServiceRepository.create(
      makeService({
        name: 'Service 3',
        description: 'Description 3',
        price: 300,
        duration: 120,
      }),
    );

    await inMemoryServiceRepository.create(
      makeService({
        name: 'Service 4',
        description: 'Description 4',
        price: 400,
        duration: 150,
      }),
    );

    await inMemoryServiceRepository.create(
      makeService({
        name: 'Service 5',
        description: 'Description 5',
        price: 500,
        duration: 180,
      }),
    );

    const result = await sut.execute();

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
    const result = await sut.execute();

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.services).toHaveLength(0);
      expect(result.value.services).toEqual([]);
    }
  });
});
