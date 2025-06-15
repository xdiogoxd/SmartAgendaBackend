import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { z } from 'zod';
import { FindServiceByIdUseCase } from '@/domain/application/use-cases/service/find-service-by-id';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const findServiceByIdParamsSchema = z.object({
  organizationId: z.string().nullable(), // todo: add a filter per organization
});

const bodyValidationPipe = new ZodValidationPipe(findServiceByIdParamsSchema);

type FindServiceByIdParamsSchema = z.infer<typeof findServiceByIdParamsSchema>;

@Controller('/services/id/:serviceId')
export class FindServiceByIdController {
  constructor(private findServiceById: FindServiceByIdUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: FindServiceByIdParamsSchema,
    @CurrentUser() userId: string,
    @Param('serviceId') serviceId: string,
  ) {
    const result = await this.findServiceById.execute({
      id: serviceId,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    return { service: result.value.service };
  }
}
