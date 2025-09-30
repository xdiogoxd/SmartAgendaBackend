import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { Service } from '@/domain/enterprise/entities/service';
import { ServiceRepository } from '@/domain/repositories/service-repository';

import { ResourceNotFoundError } from '../errors/resource-not-found-error';

export interface FindServiceByIdUseCaseRequest {
  id: string;
}

type FindServiceByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    service: Service;
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
      service: service,
    });
  }
}
