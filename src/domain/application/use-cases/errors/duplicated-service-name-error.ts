import { UseCaseError } from '@/core/errors/use-case-error';

export class DuplicatedServiceNameError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Serviço: ${identifier}, já existe`);
  }
}
