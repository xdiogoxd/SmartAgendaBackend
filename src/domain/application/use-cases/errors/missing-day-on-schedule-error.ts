import { UseCaseError } from '@/core/errors/use-case-error';

export class MissingDayOnScheduleError extends Error implements UseCaseError {
  constructor() {
    super('Dia não pode ser vazio');
  }
}
