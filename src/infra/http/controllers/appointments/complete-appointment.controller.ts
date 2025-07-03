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
import { CompleteAppointmentUseCase } from '@/domain/application/use-cases/appointments/complete-appointment';
import { AppointmentNotAvailableError } from '@/domain/application/use-cases/errors/appointment-not-available-error';
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const completeAppointmentBodySchema = z.object({
  organizationId: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(completeAppointmentBodySchema);

type CompleteAppointmentBodySchema = z.infer<
  typeof completeAppointmentBodySchema
>;

@Controller('/appointments/:appointmentId/complete')
export class CompleteAppointmentController {
  constructor(private completeAppointment: CompleteAppointmentUseCase) {}

  @Patch()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: CompleteAppointmentBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('appointmentId') appointmentId: string,
  ) {
    const { organizationId } = body;

    const userId = user.sub;

    const result = await this.completeAppointment.execute({
      organizationId,
      appointmentId,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case AppointmentNotAvailableError:
          throw new BadRequestException(result.value.message);
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
