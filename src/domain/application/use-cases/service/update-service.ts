import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { Service } from '@/domain/enterprise/entities/service';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { ServiceRepository } from '@/domain/repositories/service-repository';

import { DuplicatedServiceNameError } from '../errors/duplicated-service-name-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

export interface UpdateServiceUseCaseRequest {
  organizationId: string;
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  observations?: string | null;
}

type UpdateServiceUseCaseResponse = Either<
  DuplicatedServiceNameError | ResourceNotFoundError,
  {
    service: Service;
  }
>;

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    private servicesRepository: ServiceRepository,
    private organizationRepository: OrganizationRepository,
  ) {}

  async execute({
    organizationId,
    id,
    name,
    description,
    price,
    duration,
    observations,
  }: UpdateServiceUseCaseRequest): Promise<UpdateServiceUseCaseResponse> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(id));
    }

    const service = await this.servicesRepository.findById(id);

    if (!service) {
      return left(new ResourceNotFoundError(id));
    }

    const serviceWithSameName = await this.servicesRepository.findByName(name);

    if (serviceWithSameName && serviceWithSameName.id.toString() !== id) {
      return left(new DuplicatedServiceNameError(name));
    }

    service.name = name;
    service.description = description;
    service.price = price;
    service.duration = duration;
    service.observations = observations ?? null;

    const responseService = await this.servicesRepository.save(
      service.id.toString(),
      service,
    );

    return right({
      service: responseService,
    });
  }
}
