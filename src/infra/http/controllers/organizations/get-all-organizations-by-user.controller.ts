import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';

import { UserNotFoundError } from '@/domain/application/use-cases/errors/user-not-found-error';
import { GetAllOrganizationsByUserUseCase } from '@/domain/application/use-cases/organization/get-all-organizations-by-user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';

import { OrganizationPresenter } from '../../presenters/organizations-presenter';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization

@Controller('/organizations')
export class GetAllOrganizationsByUserController {
  constructor(
    private getAllOrganizationsByUser: GetAllOrganizationsByUserUseCase,
  ) {}

  @Get()
  @HttpCode(201)
  async handle(@CurrentUser() user: UserPayload) {
    const result = await this.getAllOrganizationsByUser.execute({
      ownerId: user.sub,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(result.value.message);
        default:
          throw new BadRequestException(result.value.message);
      }
    }

    return {
      organizations: result.value.organizations.map(
        OrganizationPresenter.toHTTP,
      ),
    };
  }
}
