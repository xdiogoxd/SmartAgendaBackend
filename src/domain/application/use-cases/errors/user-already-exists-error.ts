import { UseCaseError } from '@/core/errors/use-case-error';

export class UserAlreadyExistsError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Usuario com email: ${identifier}, ja existe`);
  }
}
