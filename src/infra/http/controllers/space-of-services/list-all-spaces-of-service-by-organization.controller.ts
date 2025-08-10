import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Param,
} from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { OrganizationNotFoundError } from '@/domain/application/use-cases/errors/organization-not-found-error';
import { ListAllSpacesOfServiceByOrganizationUseCase } from '@/domain/application/use-cases/space-of-service/list-all-spaces-of-service-by-organization';
import { SpaceOfServicePresenter } from '../../presenters/spaces-of-service-presenter';

@Controller('/organizations/:organizationId/spaceofservices')
export class ListAllSpacesOfServiceByOrganizationController {
  constructor(
    private listAllSpacesOfService: ListAllSpacesOfServiceByOrganizationUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: UserPayload,
  ) {

    const userId = user.sub;
    const result = await this.listAllSpacesOfService.execute({
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

    const spacesOfService = result.value.spacesOfService;

    return {
      spacesOfService: spacesOfService.map(SpaceOfServicePresenter.toHTTP),
    };
  }
}
