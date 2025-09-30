import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Either, left, right } from '@/core/types/either';
import { Organization } from '@/domain/enterprise/entities/organization';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { UserRepository } from '@/domain/repositories/user-repository';

import { OrganizationAlreadyExistsError } from '../errors/organization-already-exist-error';
import { UserNotFoundError } from '../errors/user-not-found-error';

export interface GetAllOrganizationsByUserUseCaseRequest {
  ownerId: string;
}

type GetAllOrganizationsByUserUseCaseResponse = Either<
  UserNotFoundError | OrganizationAlreadyExistsError,
  {
    organizations: Organization[];
  }
>;

@Injectable()
export class GetAllOrganizationsByUserUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private userRepository: UserRepository,
  ) {}

  async execute({
    ownerId,
  }: GetAllOrganizationsByUserUseCaseRequest): Promise<GetAllOrganizationsByUserUseCaseResponse> {
    const owner = await this.userRepository.findById(ownerId);

    if (!owner) {
      return left(new UserNotFoundError(ownerId));
    }

    const organizations =
      await this.organizationRepository.findAllByOwnerId(ownerId);

    return right({
      organizations,
    });
  }
}
