import { UseCaseError } from '@/core/errors/use-case-error';

export class ResourceNotFoundError extends Error implements UseCaseError {
  constructor(item: string) {
    super(`item: ${item} não encontrado`);
  }
}
