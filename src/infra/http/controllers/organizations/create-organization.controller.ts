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
import { CreateOrganizationUseCase } from '@/domain/application/use-cases/organization/create-organization';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { OrganizationAlreadyExistsError } from '@/domain/application/use-cases/errors/organization-already-exist-error';
import { UserPayload } from '@/infra/auth/jwt.strategy';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const createOrganizationBodySchema = z.object({
  name: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(createOrganizationBodySchema);

type CreateOrganizationBodySchema = z.infer<
  typeof createOrganizationBodySchema
>;

@Controller('/organizations')
export class CreateOrganizationController {
  constructor(private createOrganization: CreateOrganizationUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateOrganizationBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { name } = body;

    const result = await this.createOrganization.execute({
      ownerId: user.sub,
      name,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case OrganizationAlreadyExistsError:
          throw new ConflictException(result.value.message);
        default:
          throw new BadRequestException(result.value.message);
      }
    }

    return { organization: result.value.organization };
  }
}
