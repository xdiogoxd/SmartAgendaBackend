import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Param,
  Patch,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { UpdateServiceUseCase } from '@/domain/application/use-cases/service/update-service';
import { DuplicatedServiceNameError } from '@/domain/application/use-cases/errors/duplicated-service-name-error';

const updateServiceBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  duration: z.number(),
  observations: z.string().optional(),
});

type UpdateServiceBodySchema = z.infer<typeof updateServiceBodySchema>;

@Controller('/services')
export class UpdateServiceController {
  constructor(private updateService: UpdateServiceUseCase) {}

  @Patch(':id')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(updateServiceBodySchema))
  async handle(@Body() body: UpdateServiceBodySchema, @Param('id') id: string) {
    const { name, description, price, duration, observations } = body;

    const result = await this.updateService.execute({
      id,
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
  }
}
