import { UserRepository } from '@/domain/repositories/user-repository';

import { Either, left, right } from '@/core/types/either';
import { InvalidCredentialsError } from '../errors/invalid-credentials-error';
import { HashComparer } from '../../cryptography/hash-comparer';
import { Encrypter } from '../../cryptography/encrypter';
import { Injectable } from '@nestjs/common';

export interface AuthenticateAccountUseCaseRequest {
  email: string;
  password: string;
}

type AuthenticateAccountUseCaseResponse = Either<
  InvalidCredentialsError,
  {
    accessToken: string;
  }
>;

@Injectable()
export class AuthenticateAccountUseCase {
  constructor(
    private usersRepository: UserRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateAccountUseCaseRequest): Promise<AuthenticateAccountUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      return left(new InvalidCredentialsError());
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return left(new InvalidCredentialsError());
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
    });

    return right({
      accessToken,
    });
  }
}
