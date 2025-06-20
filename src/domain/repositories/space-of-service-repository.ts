import { SpaceOfService } from '../enterprise/entities/space-of-service';

export abstract class SpaceOfServiceRepository {
  abstract create(spaceOfService: SpaceOfService): Promise<SpaceOfService>;
  abstract findById(id: string): Promise<SpaceOfService | null>;
  abstract findByName(name: string): Promise<SpaceOfService | null>;
  abstract findAllByOrganization(
    organizationId: string,
  ): Promise<SpaceOfService[]>;
  abstract save(
    id: string,
    spaceOfService: SpaceOfService,
  ): Promise<SpaceOfService>;
  abstract delete(id: string): Promise<void>;
}
