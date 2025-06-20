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
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { FindSpaceOfServiceByNameUseCase } from '@/domain/application/use-cases/space-of-service/find-space-of-service-name';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const findSpaceOfServiceByNameParamsSchema = z.object({
  organizationId: z.string().nullable(),
});

const bodyValidationPipe = new ZodValidationPipe(
  findSpaceOfServiceByNameParamsSchema,
);

type FindSpaceOfServiceByNameParamsSchema = z.infer<
  typeof findSpaceOfServiceByNameParamsSchema
>;

@Controller('/spaceofservices/name/:spaceofserviceName')
export class FindSpaceOfServiceByNameController {
  constructor(
    private findSpaceOfServiceByName: FindSpaceOfServiceByNameUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: FindSpaceOfServiceByNameParamsSchema,
    @CurrentUser() user: UserPayload,
    @Param('spaceofserviceName') spaceofserviceName: string,
  ) {
    const userId = user.sub;
    const result = await this.findSpaceOfServiceByName.execute({
      name: spaceofserviceName,
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
