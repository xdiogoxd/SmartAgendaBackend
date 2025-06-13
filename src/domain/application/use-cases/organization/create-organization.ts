import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';

import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { Organization } from '@/domain/enterprise/entities/organization';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { UserRepository } from '@/domain/repositories/user-repository';

import { UserNotFoundError } from '../errors/user-not-found-error';
import { OrganizationAlreadyExistsError } from '../errors/organization-already-exist-error';

export interface CreateOrganizationUseCaseRequest {
  name: string;
  ownerId: string;
}

type CreateOrganizationUseCaseResponse = Either<
  UserNotFoundError | OrganizationAlreadyExistsError,
  {
    organization: Organization;
  }
>;

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private userRepository: UserRepository,
  ) {}

  async execute({
    name,
    ownerId,
  }: CreateOrganizationUseCaseRequest): Promise<CreateOrganizationUseCaseResponse> {
    const owner = await this.userRepository.findById(ownerId);

    if (!owner) {
      return left(new UserNotFoundError(ownerId));
    }

    const organizationWithSameName =
      await this.organizationRepository.findByName(name);

    if (organizationWithSameName) {
      return left(new OrganizationAlreadyExistsError(name));
    }

    const organization = Organization.create({
      name,
      ownerId,
    });

    await this.organizationRepository.create(organization);

    return right({
      organization,
    });
  }
}
