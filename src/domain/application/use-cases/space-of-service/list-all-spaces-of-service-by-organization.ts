import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';

import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { SpaceOfService } from '@/domain/enterprise/entities/space-of-service';
import { SpaceOfServiceRepository } from '@/domain/repositories/space-of-service-repository';

export interface ListAllSpacesOfServiceByOrganizationUseCaseRequest {
  organizationId: string;
}

type ListAllSpacesOfServiceByOrganizationUseCaseResponse = Either<
  OrganizationNotFoundError | null,
  {
    spacesOfService: SpaceOfService[];
  }
>;

@Injectable()
export class ListAllSpacesOfServiceByOrganizationUseCase {
  constructor(
    private spacesofserviceRepository: SpaceOfServiceRepository,
    private organizationRepository: OrganizationRepository,
  ) {}

  async execute({
    organizationId,
  }: ListAllSpacesOfServiceByOrganizationUseCaseRequest): Promise<ListAllSpacesOfServiceByOrganizationUseCaseResponse> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    const spaceOfService =
      await this.spacesofserviceRepository.findAllByOrganization(
        organizationId,
      );

    return right({
      spacesOfService: spaceOfService,
    });
  }
}
