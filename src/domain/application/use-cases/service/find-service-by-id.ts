import { ServiceRepository } from '@/domain/repositories/service-repository';
import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';
import { Service } from '@/domain/enterprise/entities/service';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

export interface FindServiceByIdUseCaseRequest {
  id: string;
}

type FindServiceByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    service: {
      id: string;
      name: string;
      description: string;
      price: number;
      duration: number;
      observations?: string | null;
    };
  }
>;

@Injectable()
export class FindServiceByIdUseCase {
  constructor(private servicesRepository: ServiceRepository) {}

  async execute({
    id,
  }: FindServiceByIdUseCaseRequest): Promise<FindServiceByIdUseCaseResponse> {
    const service = await this.servicesRepository.findById(id);

    if (!service) {
      return left(new ResourceNotFoundError(id));
    }

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
