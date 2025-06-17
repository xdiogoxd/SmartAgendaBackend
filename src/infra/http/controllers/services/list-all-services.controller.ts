import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { z } from 'zod';
import { ListAllServicesByOrganizationUseCase } from '@/domain/application/use-cases/service/list-all-services-by-organization';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { OrganizationNotFoundError } from '@/domain/application/use-cases/errors/organization-not-found-error';
import { ServicePresenter } from '../../presenters/services-presenter';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const listAllServicesParamsSchema = z.object({
  organizationId: z.string().nullable(), // todo: add a filter per organization
});

const bodyValidationPipe = new ZodValidationPipe(listAllServicesParamsSchema);

type ListAllServicesParamsSchema = z.infer<typeof listAllServicesParamsSchema>;

@Controller('/services')
export class ListAllServicesController {
  constructor(private listAllServices: ListAllServicesByOrganizationUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: ListAllServicesParamsSchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { organizationId } = body;

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
