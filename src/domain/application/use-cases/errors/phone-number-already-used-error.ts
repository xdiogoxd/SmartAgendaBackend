import { UseCaseError } from '@/core/errors/use-case-error';

export class PhoneNumberAlreadyUsedError extends Error implements UseCaseError {
  constructor(phoneNumber: string) {
    super(`Usuario com telefone: ${phoneNumber}, ja existe`);
  }
}
