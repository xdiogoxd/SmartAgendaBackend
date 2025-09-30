import { OrganizationAlreadyExistsError } from '../errors/organization-already-exist-error';
import { UserNotFoundError } from '../errors/user-not-found-error';
import { GetAllOrganizationsByUserUseCase } from './get-all-organizations-by-user';

import { makeOrganization } from 'test/factories/make-organization';
import { makeUser } from 'test/factories/make-user';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';

let inMemoryOrganizationRepository: InMemoryOrganizationRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let sut: GetAllOrganizationsByUserUseCase;

describe('Get all organizations by user', () => {
  beforeEach(() => {
    inMemoryOrganizationRepository = new InMemoryOrganizationRepository();
    inMemoryUserRepository = new InMemoryUserRepository();
    sut = new GetAllOrganizationsByUserUseCase(
      inMemoryOrganizationRepository,
      inMemoryUserRepository,
    );
  });

  it('should be able to get all organizations by user', async () => {
    const user = await inMemoryUserRepository.create(makeUser());

    const organization1 = await inMemoryOrganizationRepository.create(
      makeOrganization({ ownerId: user.id }),
    );

    const organization2 = await inMemoryOrganizationRepository.create(
      makeOrganization({ ownerId: user.id }),
    );

    const result = await sut.execute({
      ownerId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryOrganizationRepository.items).toHaveLength(2);
    expect(inMemoryOrganizationRepository.items[0].ownerId).toEqual(user.id);
  });

  it('should not locate any organization for user with non-existent organization', async () => {
    const user = await inMemoryUserRepository.create(makeUser());

    const result = await sut.execute({
      ownerId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryOrganizationRepository.items).toHaveLength(0);
  });

  it('should not locate any organization for user with non-existent user', async () => {
    //instanciated, but not created on the repository
    const user = makeUser();

    const result = await sut.execute({
      ownerId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });
});
