import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';

import { UpdateCustomerUseCase } from '@/domain/application/use-cases/customer/update-customer';
import { OrganizationNotFoundError } from '@/domain/application/use-cases/errors/organization-not-found-error';
import { PhoneNumberAlreadyUsedError } from '@/domain/application/use-cases/errors/phone-number-already-used-error';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

import { CustomerPresenter } from '../../presenters/customer-presenter';

import { z } from 'zod';

const updateCustomerBodySchema = z.object({
  name: z.string(),
  phone: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(updateCustomerBodySchema);

type UpdateCustomerBodySchema = z.infer<typeof updateCustomerBodySchema>;

@Controller('/organizations/:organizationId/customers/id/:customerId')
export class UpdateCustomerController {
  constructor(private updateCustomer: UpdateCustomerUseCase) {}

  @Patch()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: UpdateCustomerBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('organizationId') organizationId: string,
    @Param('customerId') customerId: string,
  ) {
    const { name, phone } = body;

    const result = await this.updateCustomer.execute({
      customerId,
      organizationId,
      name,
      phone,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case PhoneNumberAlreadyUsedError:
          throw new ConflictException(error.message);
        case OrganizationNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
    return { customer: CustomerPresenter.toHTTP(result.value.customer) };
  }
}
