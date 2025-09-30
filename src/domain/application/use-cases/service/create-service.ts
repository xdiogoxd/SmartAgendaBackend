import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Either, left, right } from '@/core/types/either';
import { Service } from '@/domain/enterprise/entities/service';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { ServiceRepository } from '@/domain/repositories/service-repository';

import { DuplicatedServiceNameError } from '../errors/duplicated-service-name-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';

//todo: add filter by name on each organization

export interface CreateServiceUseCaseRequest {
  organizationId: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  observations?: string | null;
}

type CreateServiceUseCaseResponse = Either<
  DuplicatedServiceNameError,
  {
    service: Service;
  }
>;

@Injectable()
export class CreateServiceUseCase {
  constructor(
    private servicesRepository: ServiceRepository,
    private organizationRepository: OrganizationRepository,
  ) {}

  async execute({
    organizationId,
    name,
    description,
    price,
    duration,
    observations,
  }: CreateServiceUseCaseRequest): Promise<CreateServiceUseCaseResponse> {
    const organization = await this.organizationRepository.findById(
      organizationId.toString(),
    );

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId.toString()));
    }

    const serviceWithSameName = await this.servicesRepository.findByName(name);

    if (serviceWithSameName) {
      return left(new DuplicatedServiceNameError(name));
    }

    const service = Service.create({
      organizationId: new UniqueEntityID(organizationId),
      name,
      description,
      price,
      duration,
      observations,
    });

    await this.servicesRepository.create(service);

    return right({
      service: service,
    });
  }
}
