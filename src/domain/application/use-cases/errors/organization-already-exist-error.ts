import { UseCaseError } from '@/core/errors/use-case-error';

export class OrganizationAlreadyExistsError
  extends Error
  implements UseCaseError
{
  constructor(organizationName: string) {
    super(`Organização: ${organizationName} já existe`);
  }
}
