import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { UpdateOrganizationUseCase } from '@/domain/application/use-cases/organization/update-organization';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { OrganizationAlreadyExistsError } from '@/domain/application/use-cases/errors/organization-already-exist-error';
import { UserPayload } from '@/infra/auth/jwt.strategy';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const updateOrganizationBodySchema = z.object({
  name: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(updateOrganizationBodySchema);

type UpdateOrganizationBodySchema = z.infer<
  typeof updateOrganizationBodySchema
>;

@Controller('/organizations/:organizationId')
export class UpdateOrganizationController {
  constructor(private updateOrganization: UpdateOrganizationUseCase) {}

  @Patch()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: UpdateOrganizationBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('organizationId') organizationId: string,
  ) {
    const { name } = body;

    const userId = user.sub;

    const result = await this.updateOrganization.execute({
      id: organizationId,
      name,
      ownerId: userId,
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
