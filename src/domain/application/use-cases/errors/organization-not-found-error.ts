import { UseCaseError } from '@/core/errors/use-case-error';

export class OrganizationNotFoundError extends Error implements UseCaseError {
  constructor(organizationId: string) {
    super(`Organização: ${organizationId} não encontrada`);
  }
}
