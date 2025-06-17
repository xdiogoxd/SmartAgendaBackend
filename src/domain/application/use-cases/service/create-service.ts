import { ServiceRepository } from '@/domain/repositories/service-repository';
import { HashGenerator } from '../../cryptography/hash-generator';
import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';
import { DuplicatedServiceNameError } from '../errors/duplicated-service-name-error';
import { Service } from '@/domain/enterprise/entities/service';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

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
  constructor(private servicesRepository: ServiceRepository) {}

  async execute({
    organizationId,
    name,
    description,
    price,
    duration,
    observations,
  }: CreateServiceUseCaseRequest): Promise<CreateServiceUseCaseResponse> {
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
