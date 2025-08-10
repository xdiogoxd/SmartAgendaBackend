import { SpaceOfService } from '../enterprise/entities/space-of-service';

export abstract class SpaceOfServiceRepository {
  abstract create(spaceOfService: SpaceOfService): Promise<SpaceOfService>;
  abstract findById(
    organizationId: string,
    id: string,
  ): Promise<SpaceOfService | null>;
  abstract findByName(
    organizationId: string,
    name: string,
  ): Promise<SpaceOfService | null>;
  abstract findAllByOrganization(
    organizationId: string,
  ): Promise<SpaceOfService[]>;
  abstract save(
    organizationId: string,
    id: string,
    spaceOfService: SpaceOfService,
  ): Promise<SpaceOfService>;
  abstract delete(organizationId: string, id: string): Promise<void>;
}
