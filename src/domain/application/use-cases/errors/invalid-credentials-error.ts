import { UseCaseError } from '@/core/errors/use-case-error';

export class InvalidCredentialsError extends Error implements UseCaseError {
  constructor() {
    super('Senha ou email invalido');
  }
}
