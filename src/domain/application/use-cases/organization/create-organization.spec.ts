import { CreateOrganizationUseCase } from './create-organization';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';

import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { OrganizationAlreadyExistsError } from '../errors/organization-already-exist-error';
import { makeUser } from 'test/factories/make-user';

let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let sut: CreateOrganizationUseCase;

describe('Create Organization', () => {
  beforeEach(() => {
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    inMemoryUserRepository = new InMemoryUserRepository();
    sut = new CreateOrganizationUseCase(
      inMemoryOrganizationRepository,
      inMemoryUserRepository,
    );
  });

  it('should be able to create a new organization', async () => {
    const user = await inMemoryUserRepository.create(makeUser());

    const result = await sut.execute({
      name: 'Test Organization',
      ownerId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryOrganizationRepository.items).toHaveLength(1);
    expect(inMemoryOrganizationRepository.items[0]).toEqual(
      expect.objectContaining({
        name: 'Test Organization',
        ownerId: user.id.toString(),
      }),
    );
  });

  it('should not be able to create an organization with existing name', async () => {
    const user = await inMemoryUserRepository.create(makeUser());

    await sut.execute({
      name: 'Test Organization1',
      ownerId: user.id.toString(),
    });

    const result = await sut.execute({
      name: 'Test Organization1',
      ownerId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(OrganizationAlreadyExistsError);
  });
});
