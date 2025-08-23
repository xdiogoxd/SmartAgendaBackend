import { UseCaseError } from '@/core/errors/use-case-error';

export class AppointmentNotFoundError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Agendamento com id: ${identifier}, nao encontrado`);
  }
}
