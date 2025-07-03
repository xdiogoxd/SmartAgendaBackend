import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { CreateSpaceOfServiceUseCase } from '@/domain/application/use-cases/space-of-service/create-space-of-service';
import { DuplicatedSpaceOfServiceNameError } from '@/domain/application/use-cases/errors/duplicated-space-of-service-name-error';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const createSpaceOfServiceBodySchema = z.object({
  organizationId: z.string(),
  name: z.string(),
  description: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(
  createSpaceOfServiceBodySchema,
);

type CreateSpaceOfServiceBodySchema = z.infer<
  typeof createSpaceOfServiceBodySchema
>;

@Controller('/spaceofservices')
export class CreateSpaceOfServiceController {
  constructor(private createSpaceOfService: CreateSpaceOfServiceUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateSpaceOfServiceBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { organizationId, name, description } = body;

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
      spaceOfService: result.value.spaceOfService,
    };
  }
}
