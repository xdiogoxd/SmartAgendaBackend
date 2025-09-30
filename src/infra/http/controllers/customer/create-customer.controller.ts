import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';

import { CreateCustomerUseCase } from '@/domain/application/use-cases/customer/create-customer';
import { OrganizationNotFoundError } from '@/domain/application/use-cases/errors/organization-not-found-error';
import { PhoneNumberAlreadyUsedError } from '@/domain/application/use-cases/errors/phone-number-already-used-error';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

import { CustomerPresenter } from '../../presenters/customer-presenter';

import { z } from 'zod';

const createCustomerBodySchema = z.object({
  name: z.string(),
  phone: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(createCustomerBodySchema);

type CreateCustomerBodySchema = z.infer<typeof createCustomerBodySchema>;

@Controller('/organizations/:organizationId/customers')
export class CreateCustomerController {
  constructor(private createCustomer: CreateCustomerUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateCustomerBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('organizationId') organizationId: string,
  ) {
    const { name, phone } = body;

    const result = await this.createCustomer.execute({
      name,
      phone,
      organizationId,
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
