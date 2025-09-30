import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';

import { GetAllCustomersByOrganizationUseCase } from '@/domain/application/use-cases/customer/get-all-customers-by-organization';
import { OrganizationNotFoundError } from '@/domain/application/use-cases/errors/organization-not-found-error';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';

import { CustomerPresenter } from '../../presenters/customer-presenter';

@Controller('/organizations/:organizationId/customers')
export class GetAllCustomersByOrganizationController {
  constructor(
    private getAllCustomersByOrganization: GetAllCustomersByOrganizationUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('organizationId') organizationId: string,
  ) {
    const result = await this.getAllCustomersByOrganization.execute({
      organizationId,
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
