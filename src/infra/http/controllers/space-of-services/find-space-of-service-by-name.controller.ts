import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { z } from 'zod';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error';
import { FindSpaceOfServiceByNameUseCase } from '@/domain/application/use-cases/space-of-service/find-space-of-service-name';
import { SpaceOfServicePresenter } from '../../presenters/spaces-of-service-presenter';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization

@Controller(
  'organizations/:organizationId/spaceofservices/name/:spaceofserviceName',
)
export class FindSpaceOfServiceByNameController {
  constructor(
    private findSpaceOfServiceByName: FindSpaceOfServiceByNameUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('spaceofserviceName') spaceofserviceName: string,
    @Param('organizationId') organizationId: string,
  ) {
    const userId = user.sub;
    const result = await this.findSpaceOfServiceByName.execute({
      organizationId,
      name: spaceofserviceName,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(result.value.message);
        default:
          throw new BadRequestException(result.value.message);
      }
    }

    return {
      spaceOfService: SpaceOfServicePresenter.toHTTP(
        result.value.spaceOfService,
      ),
    };
  }
}
