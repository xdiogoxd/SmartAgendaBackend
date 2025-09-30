import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { Service } from '@/domain/enterprise/entities/service';
import { ServiceRepository } from '@/domain/repositories/service-repository';

import { ResourceNotFoundError } from '../errors/resource-not-found-error';

export interface FindServiceByNameUseCaseRequest {
  name: string;
}

type FindServiceByNameUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    service: Service;
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
      service: service,
    });
  }
}
