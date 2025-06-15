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
import { ListAllServicesUseCase } from '@/domain/application/use-cases/service/list-all-services';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const listAllServicesParamsSchema = z.object({
  organizationId: z.string().nullable(), // todo: add a filter per organization
});

const bodyValidationPipe = new ZodValidationPipe(listAllServicesParamsSchema);

type ListAllServicesParamsSchema = z.infer<typeof listAllServicesParamsSchema>;

@Controller('/services')
export class ListAllServicesController {
  constructor(private listAllServices: ListAllServicesUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: ListAllServicesParamsSchema,
    @CurrentUser() userId: string,
  ) {
    const result = await this.listAllServices.execute();

    // if (result.isLeft()) {
    //   throw new BadRequestException(result.value.message);
    // }

    return { services: result.value.services };
  }
}
