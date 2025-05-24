import { Service } from '../enterprise/entities/services';

export abstract class ServicesRepository {
  abstract create(servico: Service): Promise<void>;
  abstract findById(id: string): Promise<Service | null>;
  abstract findByName(name: string): Promise<Service | null>;
  abstract listAll(): Promise<Service[]>;
  abstract save(servico: Service): Promise<void>;
  abstract update(id: string, data: Partial<Service>): Promise<Service | null>;
  abstract delete(id: string): Promise<void>;
}
