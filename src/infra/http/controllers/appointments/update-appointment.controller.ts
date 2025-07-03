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
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { UpdateAppointmentUseCase } from '@/domain/application/use-cases/appointments/update-appointment';
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const updateAppointmentBodySchema = z.object({
  organizationId: z.string(),
  description: z.string(),
  observations: z.string(),
  serviceId: z.string(),
  spaceOfServiceId: z.string(),
  clientId: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(updateAppointmentBodySchema);

type UpdateAppointmentBodySchema = z.infer<typeof updateAppointmentBodySchema>;

@Controller('/appointments/:appointmentId/update')
export class UpdateAppointmentController {
  constructor(private updateAppointment: UpdateAppointmentUseCase) {}

  @Patch()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: UpdateAppointmentBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('appointmentId') appointmentId: string,
  ) {
    const {
      organizationId,
      description,
      observations,
      serviceId,
      spaceOfServiceId,
      clientId,
    } = body;

    const userId = user.sub;

    const result = await this.updateAppointment.execute({
      organizationId,
      appointmentId,
      description,
      observations,
      serviceId,
      spaceOfServiceId,
      clientId,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(result.value.message);
        default:
          throw new BadRequestException(result.value.message);
      }
    }

    return {
      appointment: result.value.appointment,
    };
  }
}
