import { DuplicatedSpaceOfServiceNameError } from '../errors/duplicated-space-of-service-name-error';
import { CreateSpaceOfServiceUseCase } from './create-space-of-service';

import { makeOrganization } from 'test/factories/make-organization';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { InMemorySpaceOfServiceRepository } from 'test/repositories/in-memory-space-of-service-repository';

let inMemorySpaceOfServiceRepository: InMemorySpaceOfServiceRepository;
let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let sut: CreateSpaceOfServiceUseCase;

describe('Create SpaceOfService', () => {
  beforeEach(() => {
    inMemorySpaceOfServiceRepository = new InMemorySpaceOfServiceRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    sut = new CreateSpaceOfServiceUseCase(
      inMemorySpaceOfServiceRepository,
      inMemoryOrganizationRepository,
    );
  });

  it('should be able to create a new spaceofservice', async () => {
    const name = 'Haircut';

    const organization = makeOrganization();

    await inMemoryOrganizationRepository.create(organization);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      name,
      description: 'Space 1',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      spaceOfService: expect.objectContaining({ name }),
    });
  });

  it('should not be able to create a spaceofservice with a name already used', async () => {
    const name = 'Haircut';

    const organization = makeOrganization();

    await inMemoryOrganizationRepository.create(organization);

    await sut.execute({
      organizationId: organization.id.toString(),
      name,
      description: 'Space 2',
    });

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      name,
      description: 'Space 2',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DuplicatedSpaceOfServiceNameError);
  });
});
