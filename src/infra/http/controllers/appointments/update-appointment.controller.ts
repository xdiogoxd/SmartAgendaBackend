import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';

import { UpdateAppointmentUseCase } from '@/domain/application/use-cases/appointments/update-appointment';
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

import { AppointmentPresenter } from '../../presenters/appointments-presenter';

import { z } from 'zod';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const updateAppointmentBodySchema = z.object({
  description: z.string(),
  observations: z.string(),
  serviceId: z.string(),
  spaceOfServiceId: z.string(),
  customerPhone: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(updateAppointmentBodySchema);

type UpdateAppointmentBodySchema = z.infer<typeof updateAppointmentBodySchema>;

@Controller('/organizations/:organizationId/appointments/:appointmentId')
export class UpdateAppointmentController {
  constructor(private updateAppointment: UpdateAppointmentUseCase) {}

  @Patch()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: UpdateAppointmentBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('organizationId') organizationId: string,
    @Param('appointmentId') appointmentId: string,
  ) {
    const {
      description,
      observations,
      serviceId,
      spaceOfServiceId,
      customerPhone,
    } = body;

    const userId = user.sub;

    const result = await this.updateAppointment.execute({
      organizationId,
      appointmentId,
      description,
      observations,
      serviceId,
      spaceOfServiceId,
      customerPhone,
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
      appointment: AppointmentPresenter.toHTTP(result.value.appointment),
    };
  }
}
