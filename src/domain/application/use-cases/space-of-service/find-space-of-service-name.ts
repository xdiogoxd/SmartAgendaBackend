import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { SpaceOfServiceRepository } from '@/domain/repositories/space-of-service-repository';
import { SpaceOfService } from '@/domain/enterprise/entities/space-of-service';

export interface FindSpaceOfServiceByNameUseCaseRequest {
  organizationId: string;
  name: string;
}

type FindSpaceOfServiceByNameUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    spaceOfService: SpaceOfService;
  }
>;

@Injectable()
export class FindSpaceOfServiceByNameUseCase {
  constructor(private spaceofservicesRepository: SpaceOfServiceRepository) {}

  async execute({
    organizationId,
    name,
  }: FindSpaceOfServiceByNameUseCaseRequest): Promise<FindSpaceOfServiceByNameUseCaseResponse> {
    const spaceOfService = await this.spaceofservicesRepository.findByName(
      organizationId,
      name,
    );

    if (!spaceOfService) {
      return left(new ResourceNotFoundError(name));
    }

    return right({
      spaceOfService,
    });
  }
}
