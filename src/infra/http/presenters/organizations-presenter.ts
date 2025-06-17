import { Organization } from '@/domain/enterprise/entities/organization';

export class OrganizationPresenter {
  static toHTTP(organization: Organization) {
    return {
      id: organization.id.toString(),
      name: organization.name,
      ownerId: organization.ownerId.toString(),
      members: organization.members ?? [],
      schedules: organization.schedules ?? [],
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }
}
