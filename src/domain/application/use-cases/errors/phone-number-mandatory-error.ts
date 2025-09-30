import { UseCaseError } from '@/core/errors/use-case-error';

export class PhoneNumberMandatoryError extends Error implements UseCaseError {
  constructor() {
    super('O número de telefone é obrigatório');
  }
}
