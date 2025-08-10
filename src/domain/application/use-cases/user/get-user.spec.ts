import { FakeHasher } from 'test/cryptography/fake-hasher';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { FakeEncrypter } from 'test/cryptography/fake-encryptor';
import { makeUser } from 'test/factories/make-user';
import { InvalidCredentialsError } from '../errors/invalid-credentials-error';
import { GetUserUseCase } from './get-user';
import { UserNotFoundError } from '../errors/user-not-found-error';

let inMemoryUserRepository: InMemoryUserRepository;


let sut: GetUserUseCase;

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();

    sut = new GetUserUseCase(
      inMemoryUserRepository,
    );
  });

  it('should be able to get an user information', async () => {
    const user = makeUser({
      email: 'johndoe@example.com',
    });

    inMemoryUserRepository.items.push(user);

    const result = await sut.execute({
      id: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      user: {
        _id: {
          value: user.id.toString(),
        },
        props: {
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  });

  it('should not be able to locate an unexisting user', async () => {
    const result = await sut.execute({
      id: 'non-existing-user-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });
});
