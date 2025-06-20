import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { z } from 'zod';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { OrganizationNotFoundError } from '@/domain/application/use-cases/errors/organization-not-found-error';
import { ListAllSpacesOfServiceByOrganizationUseCase } from '@/domain/application/use-cases/space-of-service/list-all-spaces-of-service-by-organization';
import { SpaceOfServicePresenter } from '../../presenters/spaces-of-service-presenter';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const listAllSpacesOfServiceParamsSchema = z.object({
  organizationId: z.string().nullable(), // todo: add a filter per organization
});

const bodyValidationPipe = new ZodValidationPipe(
  listAllSpacesOfServiceParamsSchema,
);

type ListAllSpacesOfServiceParamsSchema = z.infer<
  typeof listAllSpacesOfServiceParamsSchema
>;

@Controller('/spaceofservices')
export class ListAllSpacesOfServiceByOrganizationController {
  constructor(
    private listAllSpacesOfService: ListAllSpacesOfServiceByOrganizationUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: ListAllSpacesOfServiceParamsSchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { organizationId } = body;

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
