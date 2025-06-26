import { UseCaseError } from '@/core/errors/use-case-error';

export class AppointmentNotAvailableError
  extends Error
  implements UseCaseError
{
  constructor(identifier: string) {
    super(`Data: ${identifier}, não está disponível no momento`);
  }
}
