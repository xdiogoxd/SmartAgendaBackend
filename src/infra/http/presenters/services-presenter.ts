import { Service } from '@/domain/enterprise/entities/service';

export class ServicePresenter {
  static toHTTP(service: Service) {
    return {
      id: service.id.toString(),
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      observations: service.observations,
    };
  }
}
