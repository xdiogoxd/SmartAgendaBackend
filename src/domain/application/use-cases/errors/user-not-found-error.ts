import { UseCaseError } from '@/core/errors/use-case-error';

export class UserNotFoundError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Usuario com email: ${identifier}, nao encontrado`);
  }
}
