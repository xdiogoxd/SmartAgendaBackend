import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';

import { DuplicatedSpaceOfServiceNameError } from '@/domain/application/use-cases/errors/duplicated-space-of-service-name-error';
import { CreateSpaceOfServiceUseCase } from '@/domain/application/use-cases/space-of-service/create-space-of-service';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

import { SpaceOfServicePresenter } from '../../presenters/spaces-of-service-presenter';

import { z } from 'zod';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const createSpaceOfServiceBodySchema = z.object({
  name: z.string(),
  description: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(
  createSpaceOfServiceBodySchema,
);

type CreateSpaceOfServiceBodySchema = z.infer<
  typeof createSpaceOfServiceBodySchema
>;

@Controller('organizations/:organizationId/spaceofservices')
export class CreateSpaceOfServiceController {
  constructor(private createSpaceOfService: CreateSpaceOfServiceUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateSpaceOfServiceBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('organizationId') organizationId: string,
  ) {
    const { name, description } = body;

    const userId = user.sub;

    const result = await this.createSpaceOfService.execute({
      organizationId,
      name,
      description,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case DuplicatedSpaceOfServiceNameError:
          throw new ConflictException(result.value.message);
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
