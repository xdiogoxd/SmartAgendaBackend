import { FakeHasher } from 'test/cryptography/fake-hasher';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { CreateAccountUseCase } from './create-account';
import { UserAlreadyExistsError } from '../errors/user-already-exists-error';

let inMemoryUserRepository: InMemoryUserRepository;
let fakeHasher: FakeHasher;

let sut: CreateAccountUseCase;

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    fakeHasher = new FakeHasher();

    sut = new CreateAccountUseCase(inMemoryUserRepository, fakeHasher);
  });

  it('should be able to create a new user', async () => {
    const name = 'John Doe';

    const result = await sut.execute({
      name,
      email: 'johndoe@example.com',
      password: '123456',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      user: expect.objectContaining({ name }),
    });
  });

  it('should not be able to create an account with an email already used', async () => {
    const email = 'johndoe@example.com';

    await sut.execute({
      name: 'John Doe',
      email,
      password: '123456',
    });

    const result = await sut.execute({
      name: 'John Doe',
      email,
      password: '123456',
    });

    expect(result.isLeft()).toBe(true);
    console.log(result.value);

    expect(result.value).toBeInstanceOf(UserAlreadyExistsError);
  });
});
