import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Either, left, right } from '@/core/types/either';
import { SpaceOfService } from '@/domain/enterprise/entities/space-of-service';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { SpaceOfServiceRepository } from '@/domain/repositories/space-of-service-repository';

import { DuplicatedSpaceOfServiceNameError } from '../errors/duplicated-space-of-service-name-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';

export interface CreateSpaceOfServiceUseCaseRequest {
  organizationId: string;
  name: string;
  description: string;
}

type CreateSpaceOfServiceUseCaseResponse = Either<
  DuplicatedSpaceOfServiceNameError | OrganizationNotFoundError,
  {
    spaceOfService: SpaceOfService;
  }
>;

@Injectable()
export class CreateSpaceOfServiceUseCase {
  constructor(
    private spaceOfServiceRepository: SpaceOfServiceRepository,
    private organizationRepository: OrganizationRepository,
  ) {}

  async execute({
    organizationId,
    name,
    description,
  }: CreateSpaceOfServiceUseCaseRequest): Promise<CreateSpaceOfServiceUseCaseResponse> {
    const organization = await this.organizationRepository.findById(
      organizationId.toString(),
    );

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId.toString()));
    }

    const spaceWithSameName = await this.spaceOfServiceRepository.findByName(
      organizationId,
      name,
    );

    if (spaceWithSameName) {
      return left(new DuplicatedSpaceOfServiceNameError(name));
    }

    const spaceOfService = SpaceOfService.create({
      organizationId: new UniqueEntityID(organizationId),
      name,
      description,
    });

    await this.spaceOfServiceRepository.create(spaceOfService);

    return right({
      spaceOfService,
    });
  }
}
