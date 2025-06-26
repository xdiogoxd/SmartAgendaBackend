import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { InMemorySpaceOfServiceRepository } from 'test/repositories/in-memory-space-of-service-repository';
import { UpdateSpaceOfServiceUseCase } from './update-space-of-service';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { makeSpaceOfService } from 'test/factories/make-space-of-service';
import { makeOrganization } from 'test/factories/make-organization';

let inMemorySpaceOfServiceRepository: InMemorySpaceOfServiceRepository;
let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let sut: UpdateSpaceOfServiceUseCase;

describe('Update SpaceOfService', () => {
  beforeEach(() => {
    inMemorySpaceOfServiceRepository = new InMemorySpaceOfServiceRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    sut = new UpdateSpaceOfServiceUseCase(
      inMemorySpaceOfServiceRepository,
      inMemoryOrganizationRepository,
    );
  });

  it('should be able to update a spaceofservice', async () => {
    const organization = makeOrganization();

    await inMemoryOrganizationRepository.create(organization);

    const newSpaceOfService = makeSpaceOfService(
      {
        organizationId: organization.id,
        name: 'Old SpaceOfService Name',
        description: 'Old Description',
      },
      new UniqueEntityID('spaceofservice-1'),
    );

    await inMemorySpaceOfServiceRepository.create(newSpaceOfService);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      id: newSpaceOfService.id.toString(),
      name: 'New SpaceOfService Name',
      description: 'New Description',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.spaceOfService.id).toEqual(newSpaceOfService.id);
    }
  });

  it('should not be able to update a non existing spaceofservice', async () => {
    const organization = makeOrganization();
    await inMemoryOrganizationRepository.create(organization);
    const organizationId = organization.id;
    const result = await sut.execute({
      organizationId: organizationId.toString(),
      id: 'non-existing-id',
      name: 'New SpaceOfService Name',
      description: 'New Description',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
