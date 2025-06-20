import { InMemoryServiceRepository } from 'test/repositories/in-memory-service-repository';
import { UpdateServiceUseCase } from './update-service';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { makeService } from 'test/factories/make-service';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { makeOrganization } from 'test/factories/make-organization';

let inMemoryServiceRepository: InMemoryServiceRepository;
let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let sut: UpdateServiceUseCase;

describe('Update Service', () => {
  beforeEach(() => {
    inMemoryServiceRepository = new InMemoryServiceRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    sut = new UpdateServiceUseCase(
      inMemoryServiceRepository,
      inMemoryOrganizationRepository,
    );
  });

  it('should be able to update a service', async () => {
    const organization = makeOrganization();
    await inMemoryOrganizationRepository.create(organization);

    const organizationId = organization.id.toString();

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
      organizationId,
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
    const organization = makeOrganization();
    await inMemoryOrganizationRepository.create(organization);

    const organizationId = organization.id.toString();

    const result = await sut.execute({
      organizationId,
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
