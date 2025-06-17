import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { CreateServiceUseCase } from '@/domain/application/use-cases/service/create-service';
import { DuplicatedServiceNameError } from '@/domain/application/use-cases/errors/duplicated-service-name-error';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const createServiceBodySchema = z.object({
  organizationId: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  duration: z.number(),
  observations: z.string().optional(),
});

const bodyValidationPipe = new ZodValidationPipe(createServiceBodySchema);

type CreateServiceBodySchema = z.infer<typeof createServiceBodySchema>;

@Controller('/services')
export class CreateServiceController {
  constructor(private createService: CreateServiceUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateServiceBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { organizationId, name, description, price, duration, observations } =
      body;

    const userId = user.sub;

    const result = await this.createService.execute({
      organizationId,
      name,
      description,
      price,
      duration,
      observations,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case DuplicatedServiceNameError:
          throw new ConflictException(result.value.message);
        default:
          throw new BadRequestException(result.value.message);
      }
    }

    return {
      service: result.value.service,
    };
  }
}
