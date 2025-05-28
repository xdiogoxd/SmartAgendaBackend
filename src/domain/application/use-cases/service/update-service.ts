import { ServiceRepository } from '@/domain/repositories/service-repository';
import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';
import { DuplicatedServiceNameError } from '../errors/duplicated-service-name-error';
import { Service } from '@/domain/enterprise/entities/service';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

export interface UpdateServiceUseCaseRequest {
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
    service: {
      id: string;
      name: string;
      description: string;
      price: number;
      duration: number;
      observations: string | null;
    };
  }
>;

@Injectable()
export class UpdateServiceUseCase {
  constructor(private servicesRepository: ServiceRepository) {}

  async execute({
    id,
    name,
    description,
    price,
    duration,
    observations,
  }: UpdateServiceUseCaseRequest): Promise<UpdateServiceUseCaseResponse> {
    const service = await this.servicesRepository.findById(id);

    if (!service) {
      return left(new ResourceNotFoundError());
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

    await this.servicesRepository.save(service.id.toString(), service);

    return right({
      service: {
        id: service.id.toString(),
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        observations: service.observations ?? null,
      },
    });
  }
}
