import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';

import { GetCustomerByPhoneAndOrganizationUseCase } from '@/domain/application/use-cases/customer/get-customer-by-phone-and-organization';
import { CustomerNotFoundError } from '@/domain/application/use-cases/errors/customer-not-found-error';
import { OrganizationNotFoundError } from '@/domain/application/use-cases/errors/organization-not-found-error';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';

import { CustomerPresenter } from '../../presenters/customer-presenter';

@Controller('/organizations/:organizationId/customers/phone/:phone')
export class GetCustomerByPhoneAndOrganizationController {
  constructor(
    private getCustomerByPhoneAndOrganization: GetCustomerByPhoneAndOrganizationUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('organizationId') organizationId: string,
    @Param('phone') phone: string,
  ) {
    const result = await this.getCustomerByPhoneAndOrganization.execute({
      phone,
      organizationId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case CustomerNotFoundError:
          throw new NotFoundException(error.message);
        case OrganizationNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
    return { customer: CustomerPresenter.toHTTP(result.value.customer) };
  }
}
