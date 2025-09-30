import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';

import { GetCustomersByNameAndOrganizationUseCase } from '@/domain/application/use-cases/customer/get-customers-by-name-and-organization';
import { OrganizationNotFoundError } from '@/domain/application/use-cases/errors/organization-not-found-error';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';

import { CustomerPresenter } from '../../presenters/customer-presenter';

@Controller('/organizations/:organizationId/customers/name/:name')
export class GetCustomersByNameAndOrganizationController {
  constructor(
    private getCustomersByNameAndOrganization: GetCustomersByNameAndOrganizationUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('organizationId') organizationId: string,
    @Param('name') name: string,
  ) {
    const result = await this.getCustomersByNameAndOrganization.execute({
      organizationId,
      name,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case OrganizationNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
    return { customers: result.value.customers.map(CustomerPresenter.toHTTP) };
  }
}
