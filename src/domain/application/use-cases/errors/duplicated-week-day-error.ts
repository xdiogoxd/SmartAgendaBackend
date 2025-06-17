import { UseCaseError } from '@/core/errors/use-case-error';

export class DuplicateWeekdayError extends Error implements UseCaseError {
  constructor() {
    super('Dia da semana duplicado');
  }
}
