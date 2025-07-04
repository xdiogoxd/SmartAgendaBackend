import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { CreateAppointmentUseCase } from '@/domain/application/use-cases/appointments/create-appointment';
import { AppointmentNotAvailableError } from '@/domain/application/use-cases/errors/appointment-not-available-error';

// todo: add a filter per organization and check autorization to
//  perform actions based on user role inside of the organization
const createAppointmentBodySchema = z.object({
  date: z.string().transform((dateString) => new Date(dateString)),
  description: z.string(),
  observations: z.string(),
  organizationId: z.string(),
  serviceId: z.string(),
  spaceOfServiceId: z.string(),
  clientId: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(createAppointmentBodySchema);

type CreateAppointmentBodySchema = z.infer<typeof createAppointmentBodySchema>;

@Controller('/appointments')
export class CreateAppointmentController {
  constructor(private createAppointment: CreateAppointmentUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateAppointmentBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const {
      organizationId,
      date,
      description,
      observations,
      serviceId,
      spaceOfServiceId,
      clientId,
    } = body;

    const userId = user.sub;

    const result = await this.createAppointment.execute({
      organizationId,
      date,
      description,
      observations,
      serviceId,
      spaceOfServiceId,
      clientId,
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
      appointment: result.value.appointment,
    };
  }
}
