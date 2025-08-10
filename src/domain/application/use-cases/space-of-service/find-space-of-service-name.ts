import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { SpaceOfServiceRepository } from '@/domain/repositories/space-of-service-repository';

export interface FindSpaceOfServiceByNameUseCaseRequest {
  organizationId: string;
  name: string;
}

type FindSpaceOfServiceByNameUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    spaceOfService: {
      id: string;
      name: string;
      description: string;
      createdAt: Date;
      updatedAt?: Date | null;
    } | null;
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
      spaceOfService: {
        id: spaceOfService.id.toString(),
        name: spaceOfService.name,
        description: spaceOfService.description,
        createdAt: spaceOfService.createdAt,
        updatedAt: spaceOfService.updatedAt,
      },
    });
  }
}
