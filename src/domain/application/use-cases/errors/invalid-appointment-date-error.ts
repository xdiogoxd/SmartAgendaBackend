import { UseCaseError } from '@/core/errors/use-case-error';

export class InvalidAppointmentDateError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Data: ${identifier}, invalida`);
  }
}
