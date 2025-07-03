import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { DeleteAppointmentUseCase } from '@/domain/application/use-cases/appointments/delete-appointment';
import { AppointmentNotAvailableError } from '@/domain/application/use-cases/errors/appointment-not-available-error';
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const deleteAppointmentBodySchema = z.object({
  organizationId: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(deleteAppointmentBodySchema);

type DeleteAppointmentBodySchema = z.infer<typeof deleteAppointmentBodySchema>;

@Controller('/appointments/:appointmentId/delete')
export class DeleteAppointmentController {
  constructor(private deleteAppointment: DeleteAppointmentUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Body(bodyValidationPipe) body: DeleteAppointmentBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('appointmentId') appointmentId: string,
  ) {
    const { organizationId } = body;

    const userId = user.sub;

    const result = await this.deleteAppointment.execute({
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
      status: 'success',
    };
  }
}
