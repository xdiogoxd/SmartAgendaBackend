import { SpaceOfService } from '@/domain/enterprise/entities/space-of-service';

export class SpaceOfServicePresenter {
  static toHTTP(spaceofservice: SpaceOfService) {
    return {
      id: spaceofservice.id.toString(),
      name: spaceofservice.name,
      description: spaceofservice.description,
      createdAt: spaceofservice.createdAt,
      updatedAt: spaceofservice.updatedAt,
    };
  }
}
