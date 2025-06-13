import { Organization } from '@/domain/enterprise/entities/organization';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { PrismaOrganizationMapper } from '../mappers/prisma-organization.mapper';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private prisma: PrismaService) {}

  async create(organization: Organization): Promise<Organization> {
    const prismaOrganization = await this.prisma.organization.create({
      data: PrismaOrganizationMapper.toPrisma(organization),
    });

    return PrismaOrganizationMapper.toDomain(prismaOrganization);
  }

  async findById(id: string): Promise<Organization | null> {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id,
      },
    });

    if (!organization) {
      return null;
    }

    return PrismaOrganizationMapper.toDomain(organization);
  }

  async findByName(name: string): Promise<Organization | null> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        name,
      },
    });

    if (!organization) {
      return null;
    }

    return PrismaOrganizationMapper.toDomain(organization);
  }

  async findAll(): Promise<Organization[]> {
    const organizations = await this.prisma.organization.findMany();

    return organizations.map(PrismaOrganizationMapper.toDomain);
  }

  async save(id: string, data: Organization): Promise<Organization> {
    const prismaOrganization = PrismaOrganizationMapper.toPrisma(data);

    const organization = await this.prisma.organization.update({
      where: {
        id,
      },
      data: prismaOrganization,
    });

    return PrismaOrganizationMapper.toDomain(organization);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.organization.delete({
      where: {
        id,
      },
    });
  }
}
