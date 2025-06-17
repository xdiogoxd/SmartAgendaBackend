import { UseCaseError } from '@/core/errors/use-case-error';

export class ScheduleAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super('Essa organização já possui um horário definido');
  }
}
