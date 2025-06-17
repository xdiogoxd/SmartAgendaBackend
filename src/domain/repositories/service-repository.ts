import { Service } from '../enterprise/entities/service';

export abstract class ServiceRepository {
  abstract create(servico: Service): Promise<Service>;
  abstract findById(id: string): Promise<Service | null>;
  abstract findByName(name: string): Promise<Service | null>;
  abstract findAllByOrganization(organizationId: string): Promise<Service[]>;
  abstract save(id: string, service: Service): Promise<Service>;
  abstract delete(id: string): Promise<void>;
}
