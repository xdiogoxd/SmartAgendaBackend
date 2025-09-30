import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';

import { CreateAppointmentUseCase } from '@/domain/application/use-cases/appointments/create-appointment';
import { AppointmentNotAvailableError } from '@/domain/application/use-cases/errors/appointment-not-available-error';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

import { AppointmentPresenter } from '../../presenters/appointments-presenter';

import { z } from 'zod';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const createAppointmentBodySchema = z.object({
  serviceId: z.string(),
  spaceOfServiceId: z.string(),
  customerPhone: z.string(),
  date: z.string().transform((dateString) => new Date(dateString)),
  description: z.string(),
  observations: z.string().optional(),
});

const bodyValidationPipe = new ZodValidationPipe(createAppointmentBodySchema);

type CreateAppointmentBodySchema = z.infer<typeof createAppointmentBodySchema>;

@Controller('/organizations/:organizationId/appointments')
export class CreateAppointmentController {
  constructor(private createAppointment: CreateAppointmentUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateAppointmentBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('organizationId') organizationId: string,
  ) {
    const {
      date,
      description,
      observations,
      serviceId,
      spaceOfServiceId,
      customerPhone,
    } = body;

    const userId = user.sub;

    const result = await this.createAppointment.execute({
      organizationId,
      date,
      description,
      observations,
      serviceId,
      spaceOfServiceId,
      customerPhone,
    });

    if (result.isLeft()) {
      switch (result.value.constructor) {
        case AppointmentNotAvailableError:
          throw new ConflictException(result.value.message);
        default:
          throw new BadRequestException(result.value.message);
      }
    }

    return {
      appointment: AppointmentPresenter.toHTTP(result.value.appointment),
    };
  }
}
