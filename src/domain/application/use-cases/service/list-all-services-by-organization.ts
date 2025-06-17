import { ServiceRepository } from '@/domain/repositories/service-repository';
import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';
import { Service } from '@/domain/enterprise/entities/service';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';

export interface ListAllServicesByOrganizationUseCaseRequest {
  organizationId: string;
}

type ListAllServicesByOrganizationUseCaseResponse = Either<
  OrganizationNotFoundError | null,
  {
    services: Service[];
  }
>;

@Injectable()
export class ListAllServicesByOrganizationUseCase {
  constructor(
    private servicesRepository: ServiceRepository,
    private organizationRepository: OrganizationRepository,
  ) {}

  async execute({
    organizationId,
  }: ListAllServicesByOrganizationUseCaseRequest): Promise<ListAllServicesByOrganizationUseCaseResponse> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    const services =
      await this.servicesRepository.findAllByOrganization(organizationId);

    return right({
      services,
    });
  }
}
