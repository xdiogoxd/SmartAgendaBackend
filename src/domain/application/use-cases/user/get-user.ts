import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { User } from '@/domain/enterprise/entities/user';
import { UserRepository } from '@/domain/repositories/user-repository';

import { UserNotFoundError } from '../errors/user-not-found-error';

export interface GetUserUseCaseRequest {
  id: string;
}

type GetUserUseCaseResponse = Either<
  UserNotFoundError,
  {
    user: User;
  }
>;

@Injectable()
export class GetUserUseCase {
  constructor(private usersRepository: UserRepository) {}

  async execute({
    id,
  }: GetUserUseCaseRequest): Promise<GetUserUseCaseResponse> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      return left(new UserNotFoundError(id));
    }

    return right({
      user: user,
    });
  }
}
