import { UseCaseError } from '@/core/errors/use-case-error';

export class DuplicatedSpaceOfServiceNameError
  extends Error
  implements UseCaseError
{
  constructor(identifier: string) {
    super(`Espaço com nome: ${identifier}, já existe`);
  }
}
