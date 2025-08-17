import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { FindServiceByNameUseCase } from '@/domain/application/use-cases/service/find-service-by-name';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { ServicePresenter } from '../../presenters/services-presenter';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization

@Controller('/organizations/:organizationId/services/name/:serviceName')
export class FindServiceByNameController {
  constructor(private findServiceByName: FindServiceByNameUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('organizationId') organizationId: string,
    @Param('serviceName') serviceName: string,
  ) {
    const userId = user.sub;
    const result = await this.findServiceByName.execute({
      name: serviceName,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(result.value.message);
        default:
          throw new BadRequestException(result.value.message);
      }
    }

    return { service: ServicePresenter.toHTTP(result.value.service) };
  }
}
