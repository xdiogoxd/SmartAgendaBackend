import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { z } from 'zod';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { CreateServiceUseCase } from '@/domain/application/use-cases/service/create-service';
import { DuplicatedServiceNameError } from '@/domain/application/use-cases/errors/duplicated-service-name-error';

const createServiceBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  duration: z.number(),
  observations: z.string().optional(),
});

type CreateServiceBodySchema = z.infer<typeof createServiceBodySchema>;

@Controller('/services')
export class CreateServiceController {
  constructor(
    private prisma: PrismaService,
    private createService: CreateServiceUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createServiceBodySchema))
  async handle(@Body() body: CreateServiceBodySchema) {
    const { name, description, price, duration, observations } = body;

    const result = await this.createService.execute({
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
