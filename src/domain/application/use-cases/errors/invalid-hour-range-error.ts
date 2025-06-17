import { UseCaseError } from '@/core/errors/use-case-error';

export class InvalidHourRangeError extends Error implements UseCaseError {
  constructor() {
    super('Horário final deve ser maior que o horário inicial');
  }
}
