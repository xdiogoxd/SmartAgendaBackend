import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';

import { UserNotFoundError } from '@/domain/application/use-cases/errors/user-not-found-error';
import { GetUserUseCase } from '@/domain/application/use-cases/user/get-user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';

import { UserPresenter } from '../../presenters/users-presenter';

@Controller('/users')
export class GetUserController {
  constructor(private getUser: GetUserUseCase) {}

  @Get()
  @HttpCode(201)
  async handle(@CurrentUser() user: UserPayload) {
    const userId = user.sub;

    const result = await this.getUser.execute({
      id: userId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return { user: UserPresenter.toHTTP(result.value.user) };
  }
}
