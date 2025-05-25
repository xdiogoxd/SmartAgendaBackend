import { UserRepository } from '@/domain/repositories/user-repository';
import { HashGenerator } from '../../cryptography/hash-generator';
import { Either, left, right } from '@/core/types/either';
import { UserAlreadyExistsError } from '../errors/user-already-exists-error';
import { User } from '@/domain/enterprise/entities/user';
import { Injectable } from '@nestjs/common';

export interface CreateAccountUseCaseRequest {
  name: string;
  email: string;
  password: string;
}

type CreateAccountUseCaseResponse = Either<
  UserAlreadyExistsError,
  {
    user: {
      name: string;
      email: string;
    };
  }
>;

@Injectable()
export class CreateAccountUseCase {
  constructor(
    private usersRepository: UserRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    email,
    password,
  }: CreateAccountUseCaseRequest): Promise<CreateAccountUseCaseResponse> {
    const userWithSameEmail = await this.usersRepository.findByEmail(email);

    if (userWithSameEmail) {
      return left(new UserAlreadyExistsError(email));
    }

    const passwordHashed = await this.hashGenerator.hash(password);

    const user = User.create({
      name,
      email,
      password: passwordHashed,
    });

    await this.usersRepository.create(user);

    return right({
      user: {
        name: user.name,
        email: user.email,
      },
    });
  }
}
