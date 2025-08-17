import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';

import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { Organization } from '@/domain/enterprise/entities/organization';
import { UserRepository } from '@/domain/repositories/user-repository';

import { UserNotFoundError } from '../errors/user-not-found-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { OrganizationAlreadyExistsError } from '../errors/organization-already-exist-error';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

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

    if (organization.name !== name) {
      const organizationWithSameName =
        await this.organizationRepository.findByName(name);

      if (organizationWithSameName) {
        return left(new OrganizationAlreadyExistsError(name));
      }
    }

    organization.name = name;
    organization.ownerId = new UniqueEntityID(ownerId);

    const responseOrganization = await this.organizationRepository.save(
      id,
      organization,
    );

    return right({
      organization: responseOrganization,
    });
  }
}
