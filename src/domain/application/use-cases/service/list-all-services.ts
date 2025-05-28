import { ServiceRepository } from '@/domain/repositories/service-repository';
import { Either, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';
import { Service } from '@/domain/enterprise/entities/service';

type ListAllServicesUseCaseResponse = Either<
  null,
  {
    services: {
      id: string;
      name: string;
      description: string;
      price: number;
      duration: number;
      observations: string | null;
    }[];
  }
>;

@Injectable()
export class ListAllServicesUseCase {
  constructor(private servicesRepository: ServiceRepository) {}

  async execute(): Promise<ListAllServicesUseCaseResponse> {
    const services = await this.servicesRepository.findAll();

    return right({
      services: services.map((service) => ({
        id: service.id.toString(),
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        observations: service.observations ?? null,
      })),
    });
  }
}
