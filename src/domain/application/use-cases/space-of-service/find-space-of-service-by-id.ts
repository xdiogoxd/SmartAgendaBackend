import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { SpaceOfServiceRepository } from '@/domain/repositories/space-of-service-repository';

export interface FindSpaceOfServiceByIdUseCaseRequest {
  organizationId: string;
  id: string;
}

type FindSpaceOfServiceByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    spaceOfService: {
      id: string;
      name: string;
      description: string;
      createdAt?: Date;
      updatedAt?: Date | null;
    };
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
      spaceOfService: {
        id: spaceofservice.id.toString(),
        name: spaceofservice.name,
        description: spaceofservice.description,
        createdAt: spaceofservice.createdAt,
        updatedAt: spaceofservice.updatedAt,
      },
    });
  }
}
