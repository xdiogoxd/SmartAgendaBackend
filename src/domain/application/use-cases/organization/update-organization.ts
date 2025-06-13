import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';

import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { Organization } from '@/domain/enterprise/entities/organization';
import { UserRepository } from '@/domain/repositories/user-repository';

import { UserNotFoundError } from '../errors/user-not-found-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';

export interface UpdateOrganizationUseCaseRequest {
  id: string;
  name: string;
  ownerId: string;
}

type UpdateOrganizationUseCaseResponse = Either<
  UserNotFoundError | OrganizationNotFoundError,
  {
    organization: Organization;
  }
>;

@Injectable()
export class UpdateOrganizationUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private userRepository: UserRepository,
  ) {}

  async execute({
    id,
    name,
    ownerId,
  }: UpdateOrganizationUseCaseRequest): Promise<UpdateOrganizationUseCaseResponse> {
    const owner = await this.userRepository.findById(ownerId);

    if (!owner) {
      return left(new UserNotFoundError(ownerId));
    }

    const organization = await this.organizationRepository.findById(id);

    if (!organization) {
      return left(new OrganizationNotFoundError(id));
    }

    organization.name = name;
    organization.ownerId = ownerId;

    await this.organizationRepository.save(id, organization);

    return right({
      organization,
    });
  }
}
