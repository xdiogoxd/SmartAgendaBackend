import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';

import { InvalidHourRangeError } from '@/domain/application/use-cases/errors/invalid-hour-range-error';
import { MissingDayOnScheduleError } from '@/domain/application/use-cases/errors/missing-day-on-schedule-error';
import { OrganizationAlreadyExistsError } from '@/domain/application/use-cases/errors/organization-already-exist-error';
import { CreateScheduleUseCase } from '@/domain/application/use-cases/schedule/create-schedule';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

import { z } from 'zod';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization

const daySchema = z.object({
  weekDay: z.number().min(0).max(6),
  startHour: z.number().min(0).max(1440),
  endHour: z.number().min(0).max(1440),
});
const createScheduleBodySchema = z.object({
  organizationId: z.string().uuid({
    message: 'Organization ID must be a valid UUID',
  }),
  days: z.array(daySchema).nonempty({
    message: 'At least one day schedule must be provided',
  }),
});

const bodyValidationPipe = new ZodValidationPipe(createScheduleBodySchema);

type CreateScheduleBodySchema = z.infer<typeof createScheduleBodySchema>;

@Controller('/schedules')
export class CreateScheduleController {
  constructor(private createSchedule: CreateScheduleUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateScheduleBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { organizationId, days } = body;

    const userId = user.sub;

    const convertedDays = days.map((selectedDay) => {
      const convertedDay = {
        weekDay: selectedDay.weekDay,
        startHour: selectedDay.startHour,
        endHour: selectedDay.endHour,
      };
      return convertedDay;
    });

    const result = await this.createSchedule.execute({
      organizationId,
      days: convertedDays,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case OrganizationAlreadyExistsError:
          throw new ConflictException(result.value.message);
        case MissingDayOnScheduleError:
          throw new BadRequestException(result.value.message);
        case InvalidHourRangeError:
          throw new BadRequestException(result.value.message);
        default:
          throw new BadRequestException(result.value.message);
      }
    }

    return { schedules: result.value.schedules };
  }
}
