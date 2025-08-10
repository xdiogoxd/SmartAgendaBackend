import { UserRepository } from '@/domain/repositories/user-repository';
import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';
import { UserNotFoundError } from '../errors/user-not-found-error';

export interface GetUserUseCaseRequest {
  id: string;
}

type GetUserUseCaseResponse = Either<
  UserNotFoundError,
  {
    user: {
      _id: {
        value: string;
      };
      props: {
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
      };
    };
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
  }
}
