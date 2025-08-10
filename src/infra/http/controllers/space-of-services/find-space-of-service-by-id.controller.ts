import {
  BadRequestException,
  Body,
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
import { FindSpaceOfServiceByIdUseCase } from '@/domain/application/use-cases/space-of-service/find-space-of-service-by-id';
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization

@Controller(
  'organizations/:organizationId/spaceofservices/id/:spaceofserviceId',
)
export class FindSpaceOfServiceByIdController {
  constructor(private findSpaceOfServiceById: FindSpaceOfServiceByIdUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('spaceofserviceId') spaceofserviceId: string,
    @Param('organizationId') organizationId: string,
  ) {
    const userId = user.sub;
    const result = await this.findSpaceOfServiceById.execute({
      organizationId,
      id: spaceofserviceId,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(result.value.message);
        default:
          throw new BadRequestException(result.value.message);
      }
    }

    return { spaceOfService: result.value.spaceOfService };
  }
}
