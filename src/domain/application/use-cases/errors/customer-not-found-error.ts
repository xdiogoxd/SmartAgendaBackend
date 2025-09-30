import { UseCaseError } from '@/core/errors/use-case-error';

export class CustomerNotFoundError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Cliente com identificador: ${identifier}, não encontrado`);
  }
}
