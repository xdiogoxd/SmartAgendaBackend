import { Organization } from '../enterprise/entities/organization';

//todo: Filtrar orgs por membros, memberOf

export abstract class OrganizationRepository {
  abstract create(organization: Organization): Promise<Organization>;
  abstract findById(id: string): Promise<Organization | null>;
  abstract findByName(name: string): Promise<Organization | null>;
  abstract findAllByOwnerId(ownerId: string): Promise<Organization[]>;
  abstract findAll(): Promise<Organization[]>;
  abstract save(id: string, organization: Organization): Promise<Organization>;
  abstract delete(id: string): Promise<void>;
}
