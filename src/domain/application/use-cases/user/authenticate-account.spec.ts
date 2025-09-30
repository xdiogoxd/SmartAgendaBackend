import { InvalidCredentialsError } from '../errors/invalid-credentials-error';
import { AuthenticateAccountUseCase } from './authenticate-account';

import { FakeEncrypter } from 'test/cryptography/fake-encryptor';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { makeUser } from 'test/factories/make-user';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';

let inMemoryUserRepository: InMemoryUserRepository;
let fakeHasher: FakeHasher;
let fakeEncrypter: FakeEncrypter;

let sut: AuthenticateAccountUseCase;

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    fakeHasher = new FakeHasher();
    fakeEncrypter = new FakeEncrypter();

    sut = new AuthenticateAccountUseCase(
      inMemoryUserRepository,
      fakeHasher,
      fakeEncrypter,
    );
  });

  it('should be able to authenticate an user', async () => {
    const user = makeUser({
      email: 'johndoe@example.com',
      password: await fakeHasher.hash('123456'),
    });

    inMemoryUserRepository.items.push(user);

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    });
  });

  it('should not be able to authenticate an user with wrong credentials', async () => {
    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '1234561',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidCredentialsError);
  });
});
