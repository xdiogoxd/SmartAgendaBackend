import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';

import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error';
import { FindServiceByIdUseCase } from '@/domain/application/use-cases/service/find-service-by-id';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { ServicePresenter } from '../../presenters/services-presenter';

import { z } from 'zod';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const findServiceByIdParamsSchema = z.object({
  organizationId: z.string().nullable(), // todo: add a filter per organization
});

const bodyValidationPipe = new ZodValidationPipe(findServiceByIdParamsSchema);

type FindServiceByIdParamsSchema = z.infer<typeof findServiceByIdParamsSchema>;

@Controller('/services/id/:serviceId')
export class FindServiceByIdController {
  constructor(private findServiceById: FindServiceByIdUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: FindServiceByIdParamsSchema,
    @CurrentUser() user: UserPayload,
    @Param('serviceId') serviceId: string,
  ) {
    const userId = user.sub;
    const result = await this.findServiceById.execute({
      id: serviceId,
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
