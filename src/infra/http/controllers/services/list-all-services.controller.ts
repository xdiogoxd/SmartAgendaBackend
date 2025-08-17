import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Param,
} from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { ListAllServicesByOrganizationUseCase } from '@/domain/application/use-cases/service/list-all-services-by-organization';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { OrganizationNotFoundError } from '@/domain/application/use-cases/errors/organization-not-found-error';
import { ServicePresenter } from '../../presenters/services-presenter';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization

@Controller('/organizations/:organizationId/services')
export class ListAllServicesController {
  constructor(private listAllServices: ListAllServicesByOrganizationUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub;
    const result = await this.listAllServices.execute({
      organizationId,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case OrganizationNotFoundError:
          throw new BadRequestException(result.value.message);
        default:
          throw new BadRequestException(result.value.message);
      }
    }

    const services = result.value.services;

    return { services: services.map(ServicePresenter.toHTTP) };
  }
}
