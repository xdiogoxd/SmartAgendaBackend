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
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { UpdateSpaceOfServiceUseCase } from '@/domain/application/use-cases/space-of-service/update-space-of-service';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const updateSpaceOfServiceBodySchema = z.object({
  organizationId: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  duration: z.number(),
  observations: z.string().optional(),
});

const bodyValidationPipe = new ZodValidationPipe(
  updateSpaceOfServiceBodySchema,
);

type UpdateSpaceOfServiceBodySchema = z.infer<
  typeof updateSpaceOfServiceBodySchema
>;

@Controller('/spaceofservices/id/:spaceofserviceId')
export class UpdateSpaceOfServiceController {
  constructor(private updateSpaceOfService: UpdateSpaceOfServiceUseCase) {}

  @Patch()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: UpdateSpaceOfServiceBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('spaceofserviceId') spaceofserviceId: string,
  ) {
    const { organizationId, name, description, price, duration, observations } =
      body;

    const result = await this.updateSpaceOfService.execute({
      organizationId: new UniqueEntityID(organizationId),
      id: new UniqueEntityID(spaceofserviceId),
      name,
      description,
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
