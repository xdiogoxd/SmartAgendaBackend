import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { SpaceOfService } from '@/domain/enterprise/entities/space-of-service';
import { SpaceOfServiceRepository } from '@/domain/repositories/space-of-service-repository';

import { ResourceNotFoundError } from '../errors/resource-not-found-error';

export interface FindSpaceOfServiceByIdUseCaseRequest {
  organizationId: string;
  id: string;
}

type FindSpaceOfServiceByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    spaceOfService: SpaceOfService;
  }
>;

@Injectable()
export class FindSpaceOfServiceByIdUseCase {
  constructor(private spaceofservicesRepository: SpaceOfServiceRepository) {}

  async execute({
    organizationId,
    id,
  }: FindSpaceOfServiceByIdUseCaseRequest): Promise<FindSpaceOfServiceByIdUseCaseResponse> {
    const spaceofservice = await this.spaceofservicesRepository.findById(
      organizationId,
      id,
    );

    if (!spaceofservice) {
      return left(new ResourceNotFoundError(id));
    }

    return right({
      spaceOfService: spaceofservice,
    });
  }
}
