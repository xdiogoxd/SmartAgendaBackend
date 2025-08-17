import { SpaceOfServiceRepository } from '@/domain/repositories/space-of-service-repository';
import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';

import { SpaceOfService } from '@/domain/enterprise/entities/space-of-service';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { DuplicatedSpaceOfServiceNameError } from '../errors/duplicated-space-of-service-name-error';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

export interface UpdateSpaceOfServiceUseCaseRequest {
  id: string;
  organizationId: string;
  name: string;
  description: string;
}

type UpdateSpaceOfServiceUseCaseResponse = Either<
  | DuplicatedSpaceOfServiceNameError
  | OrganizationNotFoundError
  | ResourceNotFoundError,
  {
    spaceOfService: SpaceOfService;
  }
>;

@Injectable()
export class UpdateSpaceOfServiceUseCase {
  constructor(
    private spaceOfServiceRepository: SpaceOfServiceRepository,
    private organizationRepository: OrganizationRepository,
  ) {}

  async execute({
    id,
    organizationId,
    name,
    description,
  }: UpdateSpaceOfServiceUseCaseRequest): Promise<UpdateSpaceOfServiceUseCaseResponse> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId.toString()));
    }

    const spaceOfService = await this.spaceOfServiceRepository.findById(
      organizationId,
      id,
    );

    if (!spaceOfService) {
      return left(new ResourceNotFoundError(id.toString()));
    }

    const spaceWithSameName = await this.spaceOfServiceRepository.findByName(
      organizationId,
      name,
    );

    if (
      spaceWithSameName &&
      spaceWithSameName.organizationId.toString() !== organizationId
    ) {
      return left(new DuplicatedSpaceOfServiceNameError(name));
    }

    spaceOfService.name = name;
    spaceOfService.description = description;

    const responseService = await this.spaceOfServiceRepository.save(
      organizationId,
      spaceOfService.id.toString(),
      spaceOfService,
    );

    return right({
      spaceOfService: responseService,
    });
  }
}
