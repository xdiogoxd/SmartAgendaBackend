import { Organization } from '@/domain/enterprise/entities/organization';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';

export class InMemoryOrganizationRepository implements OrganizationRepository {
  public items: Organization[] = [];
  async create(organization: Organization) {
    this.items.push(organization);
    return organization;
  }

  async findById(id: string): Promise<Organization | null> {
    const organization = this.items.find((item) => item.id.toString() === id);

    if (!organization) {
      return null;
    }

    return organization;
  }
  async findByName(name: string): Promise<Organization | null> {
    const organization = this.items.find((item) => item.name === name);

    if (!organization) {
      return null;
    }

    return organization;
  }

  async findAll(): Promise<Organization[]> {
    return this.items;
  }

  async save(id: string, data: Organization): Promise<Organization> {
    const index = this.items.findIndex((item) => item.id.toString() === id);
    this.items[index] = data;
    return data;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id.toString() !== id);
  }
}
