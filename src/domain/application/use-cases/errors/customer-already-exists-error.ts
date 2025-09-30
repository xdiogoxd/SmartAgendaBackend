import { UseCaseError } from '@/core/errors/use-case-error';

export class CustomerAlreadyExistsError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Cliente com email: ${identifier}, já existe`);
  }
}
