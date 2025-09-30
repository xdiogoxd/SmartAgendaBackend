import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
} from '@nestjs/common';

import { ListAppointmentsByDateRangeUseCase } from '@/domain/application/use-cases/appointments/list-appointments-by-date-range';
import { AppointmentNotAvailableError } from '@/domain/application/use-cases/errors/appointment-not-available-error';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

import { AppointmentPresenter } from '../../presenters/appointments-presenter';

import { z } from 'zod';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organizatio

const listAppointmentsByDateRangeQuerySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

type ListAppointmentsByDateRangeQuerySchema = z.infer<
  typeof listAppointmentsByDateRangeQuerySchema
>;

@Controller('/organizations/:organizationId/appointments/list')
export class ListAppointmentsByDateRangeController {
  constructor(
    private listAppointmentsByDateRange: ListAppointmentsByDateRangeUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query(new ZodValidationPipe(listAppointmentsByDateRangeQuerySchema))
    query: ListAppointmentsByDateRangeQuerySchema,
    @CurrentUser() user: UserPayload,
    @Param('organizationId') organizationId: string,
  ) {
    const { startDate, endDate } = query;
    const userId = user.sub;

    const result = await this.listAppointmentsByDateRange.execute({
      organizationId,
      startDate,
      endDate,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case AppointmentNotAvailableError:
          throw new BadRequestException(result.value.message);
        default:
          throw new BadRequestException(result.value.message);
      }
    }

    return {
      appointments: result.value.appointments.map(AppointmentPresenter.toHTTP),
    };
  }
}
