import { SpaceOfService } from '@/domain/enterprise/entities/space-of-service';
import { SpaceOfServiceRepository } from '@/domain/repositories/space-of-service-repository';

export class InMemorySpaceOfServiceRepository
  implements SpaceOfServiceRepository
{
  async findById(
    organizationId: string,
    id: string,
  ): Promise<SpaceOfService | null> {
    const spaceofservice = this.items.find(
      (item) =>
        item.id.toString() === id &&
        item.organizationId.toString() === organizationId,
    );

    if (!spaceofservice) {
      return null;
    }

    return spaceofservice;
  }

  async findByName(
    organizationId: string,
    name: string,
  ): Promise<SpaceOfService | null> {
    const spaceofservice = this.items.find(
      (item) =>
        item.name === name && item.organizationId.toString() === organizationId,
    );

    if (!spaceofservice) {
      return null;
    }

    return spaceofservice;
  }
  async findAllByOrganization(
    organizationId: string,
  ): Promise<SpaceOfService[]> {
    const spaceofservices = this.items.filter(
      (item) => item.organizationId.toString() === organizationId,
    );
    return spaceofservices;
  }
  public items: SpaceOfService[] = [];
  async create(spaceofservice: SpaceOfService) {
    this.items.push(spaceofservice);
    return spaceofservice;
  }

  async save(
    organizationId: string,
    id: string,
    data: SpaceOfService,
  ): Promise<SpaceOfService> {
    const index = this.items.findIndex(
      (item) =>
        item.id.toString() === id &&
        item.organizationId.toString() === organizationId,
    );
    this.items[index] = data;
    return data;
  }

  async delete(organizationId: string, id: string): Promise<void> {
    this.items = this.items.filter(
      (item) =>
        item.id.toString() !== id &&
        item.organizationId.toString() !== organizationId,
    );
  }
}
