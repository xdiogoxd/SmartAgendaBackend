import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { AppointmentNotAvailableError } from '@/domain/application/use-cases/errors/appointment-not-available-error';
import { FindAppointmentByIdUseCase } from '@/domain/application/use-cases/appointments/find-appointment-by-id';
import { AppointmentPresenter } from '../../presenters/appointments-presenter';
import { AppointmentNotFoundError } from '@/domain/application/use-cases/errors/appointment-not-found-error';
import { OrganizationNotFoundError } from '@/domain/application/use-cases/errors/organization-not-found-error';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organizatio

@Controller('/organizations/:organizationId/appointments/id/:appointmentId')
export class FindAppointmentByIdController {
  constructor(private findAppointmentById: FindAppointmentByIdUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('organizationId') organizationId: string,
    @Param('appointmentId') appointmentId: string,
  ) {
    const userId = user.sub;

    const result = await this.findAppointmentById.execute({
      organizationId,
      appointmentId,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case AppointmentNotFoundError:
          throw new NotFoundException(result.value.message);
        case OrganizationNotFoundError:
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
