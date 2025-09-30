import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';

import { RescheduleAppointmentUseCase } from '@/domain/application/use-cases/appointments/reschedule-appointment';
import { AppointmentNotAvailableError } from '@/domain/application/use-cases/errors/appointment-not-available-error';
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

import { AppointmentPresenter } from '../../presenters/appointments-presenter';

import { z } from 'zod';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const rescheduleAppointmentBodySchema = z.object({
  date: z.coerce.date(),
});

const bodyValidationPipe = new ZodValidationPipe(
  rescheduleAppointmentBodySchema,
);

type RescheduleAppointmentBodySchema = z.infer<
  typeof rescheduleAppointmentBodySchema
>;

@Controller(
  '/organizations/:organizationId/appointments/:appointmentId/reschedule',
)
export class RescheduleAppointmentController {
  constructor(private rescheduleAppointment: RescheduleAppointmentUseCase) {}

  @Patch()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: RescheduleAppointmentBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('organizationId') organizationId: string,
    @Param('appointmentId') appointmentId: string,
  ) {
    const { date } = body;

    const userId = user.sub;

    const result = await this.rescheduleAppointment.execute({
      organizationId,
      appointmentId,
      date,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case AppointmentNotAvailableError:
          throw new ConflictException(result.value.message);
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
