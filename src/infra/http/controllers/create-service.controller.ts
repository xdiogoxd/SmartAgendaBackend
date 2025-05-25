import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { z } from 'zod';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const createServiceBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  duration: z.number(),
  image: z.string().optional(),
  observations: z.string().optional(),
});

type CreateServiceBodySchema = z.infer<typeof createServiceBodySchema>;

@Controller('/services')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createServiceBodySchema))
  async handle(@Body() body: CreateServiceBodySchema) {
    const { name, description, price, duration, image, observations } = body;

    // await this.prisma.service.create({
    //   data: {
    //     name,
    //     description,
    //     price,
    //     duration,
    //     image,
    //     observations,
    //   },
    // });
  }
}
