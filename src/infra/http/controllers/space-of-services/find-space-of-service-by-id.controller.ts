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
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { FindSpaceOfServiceByIdUseCase } from '@/domain/application/use-cases/space-of-service/find-space-of-service-by-id';
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const findSpaceOfServiceByIdParamsSchema = z.object({
  organizationId: z.string().nullable(), // todo: add a filter per organization
});

const bodyValidationPipe = new ZodValidationPipe(
  findSpaceOfServiceByIdParamsSchema,
);

type FindSpaceOfServiceByIdParamsSchema = z.infer<
  typeof findSpaceOfServiceByIdParamsSchema
>;

@Controller('/spaceofservices/id/:spaceofserviceId')
export class FindSpaceOfServiceByIdController {
  constructor(private findSpaceOfServiceById: FindSpaceOfServiceByIdUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: FindSpaceOfServiceByIdParamsSchema,
    @CurrentUser() user: UserPayload,
    @Param('spaceofserviceId') spaceofserviceId: string,
  ) {
    const userId = user.sub;
    const result = await this.findSpaceOfServiceById.execute({
      id: spaceofserviceId,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(result.value.message);
        default:
          throw new BadRequestException(result.value.message);
      }
    }

    return { spaceOfService: result.value.spaceOfService };
  }
}
