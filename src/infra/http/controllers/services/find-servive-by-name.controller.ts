import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { z } from 'zod';
import { FindServiceByNameUseCase } from '@/domain/application/use-cases/service/find-service-by-name';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const findServiceByNameParamsSchema = z.object({
  organizationId: z.string().nullable(),
});

const bodyValidationPipe = new ZodValidationPipe(findServiceByNameParamsSchema);

type FindServiceByNameParamsSchema = z.infer<
  typeof findServiceByNameParamsSchema
>;

@Controller('/services/name/:serviceName')
export class FindServiceByNameController {
  constructor(private findServiceByName: FindServiceByNameUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: FindServiceByNameParamsSchema,
    @CurrentUser() user: UserPayload,
    @Param('serviceName') serviceName: string,
  ) {
    const userId = user.sub;
    const result = await this.findServiceByName.execute({
      name: serviceName,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(result.value.message);
        default:
          throw new BadRequestException(result.value.message);
      }
    }

    return { service: result.value.service };
  }
}
