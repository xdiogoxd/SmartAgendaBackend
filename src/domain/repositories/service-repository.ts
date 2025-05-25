import { Service } from '../enterprise/entities/services';

export abstract class ServiceRepository {
  abstract create(servico: Service): Promise<Service>;
  abstract findById(id: string): Promise<Service | null>;
  abstract findByName(name: string): Promise<Service | null>;
  abstract findAll(): Promise<Service[]>;
  abstract save(servico: Service): Promise<Service>;
  abstract update(id: string, data: Partial<Service>): Promise<Service | null>;
  abstract delete(id: string): Promise<Service>;
}
