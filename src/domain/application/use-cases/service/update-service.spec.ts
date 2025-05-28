import { InMemoryServiceRepository } from 'test/repositories/in-memory-service-repository';
import { UpdateServiceUseCase } from './update-service';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { makeService } from 'test/factories/make-service';

let inMemoryServiceRepository: InMemoryServiceRepository;
let sut: UpdateServiceUseCase;

describe('Update Service', () => {
  beforeEach(() => {
    inMemoryServiceRepository = new InMemoryServiceRepository();
    sut = new UpdateServiceUseCase(inMemoryServiceRepository);
  });

  it('should be able to update a service', async () => {
    const newService = makeService(
      {
        name: 'Old Service Name',
        description: 'Old Description',
        duration: 30,
        price: 50,
      },
      new UniqueEntityID('service-1'),
    );

    await inMemoryServiceRepository.create(newService);

    const result = await sut.execute({
      id: 'service-1',
      name: 'New Service Name',
      description: 'New Description',
      duration: 60,
      price: 100,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.service.id).toEqual('service-1');
      expect(result.value.service.name).toEqual('New Service Name');
      expect(result.value.service.description).toEqual('New Description');
      expect(result.value.service.duration).toEqual(60);
      expect(result.value.service.price).toEqual(100);
    }
  });

  it('should not be able to update a non existing service', async () => {
    const result = await sut.execute({
      id: 'non-existing-id',
      name: 'New Service Name',
      description: 'New Description',
      duration: 60,
      price: 100,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
