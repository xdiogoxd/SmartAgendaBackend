import { User } from '@/domain/enterprise/entities/user';
import { UserRepository } from '@/domain/repositories/user-repository';
import { PrismaUserMapper } from '../mappers/prisma-user.mapper';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}
  async create(user: User): Promise<User> {
    const { name, email, password } = user;

    const userCreated = await this.prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });

    return PrismaUserMapper.toDomain(userCreated);
  }
  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return null;
    }

    return PrismaUserMapper.toDomain(user);
  }
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    return PrismaUserMapper.toDomain(user);
  }
  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();

    return users.map(PrismaUserMapper.toDomain);
  }
  async save(id: string, data: User): Promise<User> {
    const prismaUser = PrismaUserMapper.toPrisma(data);

    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: prismaUser,
    });

    return PrismaUserMapper.toDomain(user);
  }
  async delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
