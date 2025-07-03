import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { AppointmentNotAvailableError } from '@/domain/application/use-cases/errors/appointment-not-available-error';
import { ListAppointmentsByMonthUseCase } from '@/domain/application/use-cases/appointments/list-appointments-by-month';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization

// 1 to 12, 1 being january and 12 being december
const listAppointmentsByMonthParamSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2024),
});

type ListAppointmentsByMonthParamSchema = z.infer<
  typeof listAppointmentsByMonthParamSchema
>;

@Controller('/appointments/list/:organizationId/month')
export class ListAppointmentsByMonthController {
  constructor(private listAppointmentByMonth: ListAppointmentsByMonthUseCase) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query(new ZodValidationPipe(listAppointmentsByMonthParamSchema))
    params: ListAppointmentsByMonthParamSchema,
    @CurrentUser() user: UserPayload,
    @Param('organizationId') organizationId: string,
  ) {
    const { month, year } = params;

    const userId = user.sub;

    const result = await this.listAppointmentByMonth.execute({
      organizationId,
      month,
      year,
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
      appointments: result.value.appointments,
    };
  }
}
