import { CreateServiceUseCase } from './create-service';
import { DuplicatedServiceNameError } from '../errors/duplicated-service-name-error';
import { InMemoryServiceRepository } from 'test/repositories/in-memory-service-repository';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { makeOrganization } from 'test/factories/make-organization';

let inMemoryServiceRepository: InMemoryServiceRepository;
let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let sut: CreateServiceUseCase;

describe('Create Service', () => {
  beforeEach(() => {
    inMemoryServiceRepository = new InMemoryServiceRepository();
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    sut = new CreateServiceUseCase(
      inMemoryServiceRepository,
      inMemoryOrganizationRepository,
    );
  });

  it('should be able to create a new service', async () => {
    const name = 'Haircut';

    const organization = makeOrganization();

    await inMemoryOrganizationRepository.create(organization);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      name,
      description: 'Basic haircut service',
      duration: 30,
      price: 25.0,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      service: expect.objectContaining({ name }),
    });
  });

  it('should not be able to create a service with a name already used', async () => {
    const name = 'Haircut';

    const organization = makeOrganization();

    await inMemoryOrganizationRepository.create(organization);

    await sut.execute({
      organizationId: organization.id.toString(),
      name,
      description: 'Basic haircut service',
      duration: 30,
      price: 25.0,
    });

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      name,
      description: 'Another haircut service',
      duration: 45,
      price: 35.0,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DuplicatedServiceNameError);
  });
});
