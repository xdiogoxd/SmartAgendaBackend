import { ServiceRepository } from '@/domain/repositories/service-repository';
import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

export interface FindServiceByNameUseCaseRequest {
  name: string;
}

type FindServiceByNameUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    service: {
      id: string;
      name: string;
      description: string;
      price: number;
      duration: number;
      observations: string | null;
    } | null;
  }
>;

@Injectable()
export class FindServiceByNameUseCase {
  constructor(private servicesRepository: ServiceRepository) {}

  async execute({
    name,
  }: FindServiceByNameUseCaseRequest): Promise<FindServiceByNameUseCaseResponse> {
    const service = await this.servicesRepository.findByName(name);

    if (!service) {
      return left(new ResourceNotFoundError(name));
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
