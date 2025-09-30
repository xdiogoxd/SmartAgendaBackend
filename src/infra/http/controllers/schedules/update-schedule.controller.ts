import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Put,
} from '@nestjs/common';

import { OrganizationNotFoundError } from '@/domain/application/use-cases/errors/organization-not-found-error';
import { UpdateScheduleUseCase } from '@/domain/application/use-cases/schedule/update-schedule';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

import { z } from 'zod';

const daySchema = z.object({
  weekDay: z.number().min(0).max(6),
  startHour: z.number().min(0).max(1440),
  endHour: z.number().min(0).max(1440),
});

const updateScheduleBodySchema = z.object({
  organizationId: z.string(),
  days: z.array(daySchema).nonempty({
    message: 'At least one day schedule must be provided',
  }),
});

const bodyValidationPipe = new ZodValidationPipe(updateScheduleBodySchema);

type UpdateScheduleBodySchema = z.infer<typeof updateScheduleBodySchema>;

@Controller('/schedules')
export class UpdateScheduleController {
  constructor(private updateSchedule: UpdateScheduleUseCase) {}

  @Put()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: UpdateScheduleBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { organizationId, days } = body;

    const convertedDays = days.map((selectedDay) => {
      return {
        weekDay: selectedDay.weekDay,
        startHour: selectedDay.startHour,
        endHour: selectedDay.endHour,
      };
    });

    const result = await this.updateSchedule.execute({
      organizationId,
      days: convertedDays,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case OrganizationNotFoundError:
          throw new NotFoundException(result.value.message);
        default:
          throw new BadRequestException(result.value.message);
      }
    }

    return { schedule: result.value.schedule };
  }
}
