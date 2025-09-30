import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { Organization } from '@/domain/enterprise/entities/organization';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';

import { OrganizationNotFoundError } from '../errors/organization-not-found-error';

export interface DeleteOrganizationUseCaseRequest {
  organizationId: string;
}

type DeleteOrganizationUseCaseResponse = Either<
  OrganizationNotFoundError,
  {
    organization: Organization;
  }
>;

//Base use case implemented, but not implemented all the cascading deletes

@Injectable()
export class DeleteOrganizationUseCase {
  constructor(private organizationRepository: OrganizationRepository) {}

  async execute({
    organizationId,
  }: DeleteOrganizationUseCaseRequest): Promise<DeleteOrganizationUseCaseResponse> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    await this.organizationRepository.delete(organizationId);

    return right({
      organization,
    });
  }
}
