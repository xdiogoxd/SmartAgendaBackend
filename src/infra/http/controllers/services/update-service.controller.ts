import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { UpdateServiceUseCase } from '@/domain/application/use-cases/service/update-service';
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const updateServiceBodySchema = z.object({
  organizationId: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  duration: z.number(),
  observations: z.string().optional(),
});

const bodyValidationPipe = new ZodValidationPipe(updateServiceBodySchema);

type UpdateServiceBodySchema = z.infer<typeof updateServiceBodySchema>;

@Controller('/services/id/:serviceId')
export class UpdateServiceController {
  constructor(private updateService: UpdateServiceUseCase) {}

  @Patch()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: UpdateServiceBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('serviceId') serviceId: string,
  ) {
    const { organizationId, name, description, price, duration, observations } =
      body;

    const result = await this.updateService.execute({
      organizationId,
      id: serviceId,
      name,
      description,
      price,
      duration,
      observations,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(result.value.message);
        default:
          throw new BadRequestException(result.value.message);
      }
    }
  }
}
