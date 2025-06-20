import { UpdateOrganizationUseCase } from './update-organization';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { makeOrganization } from 'test/factories/make-organization';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { makeUser } from 'test/factories/make-user';

let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let sut: UpdateOrganizationUseCase;

describe('Update Organization', () => {
  beforeEach(() => {
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    inMemoryUserRepository = new InMemoryUserRepository();
    sut = new UpdateOrganizationUseCase(
      inMemoryOrganizationRepository,
      inMemoryUserRepository,
    );
  });

  it('should be able to update an organization', async () => {
    const user = await inMemoryUserRepository.create(makeUser());
    const organization = makeOrganization({ ownerId: user.id });
    await inMemoryOrganizationRepository.create(organization);

    const result = await sut.execute({
      id: organization.id.toString(),
      name: 'New Organization Name',
      ownerId: organization.ownerId.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryOrganizationRepository.items[0].name).toEqual(
      'New Organization Name',
    );
    expect(inMemoryOrganizationRepository.items[0].ownerId).toEqual(
      organization.ownerId,
    );
  });

  it('should not be able to update a non existing organization', async () => {
    const user = await inMemoryUserRepository.create(makeUser());
    const result = await sut.execute({
      id: 'non-existing-id',
      name: 'New Organization Name',
      ownerId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
  });
});
