import { Service } from '@/domain/enterprise/entities/service';
import { ServiceRepository } from '@/domain/repositories/service-repository';

export class InMemoryServiceRepository implements ServiceRepository {
  public items: Service[] = [];
  async create(service: Service) {
    this.items.push(service);
    return service;
  }

  async findById(id: string): Promise<Service | null> {
    const service = this.items.find((item) => item.id.toString() === id);

    if (!service) {
      return null;
    }

    return service;
  }

  async findByName(name: string): Promise<Service | null> {
    const service = this.items.find((item) => item.name === name);

    if (!service) {
      return null;
    }

    return service;
  }

  async findAll(): Promise<Service[]> {
    return this.items;
  }

  async save(id: string, data: Service): Promise<Service> {
    const index = this.items.findIndex((item) => item.id.toString() === id);
    this.items[index] = data;
    return data;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id.toString() !== id);
  }
}
