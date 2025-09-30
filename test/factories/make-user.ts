import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { User, UserProps } from '@/domain/enterprise/entities/user';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { PrismaUserMapper } from '@/infra/database/prisma/mappers/prisma-user.mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

import { faker } from '@faker-js/faker';

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityID,
) {
  const user = User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      createdAt: faker.date.recent(),
      ...override,
    },
    id,
  );
  return user;
}

@Injectable()
export class UserFactory {
  constructor(
    private prisma: PrismaService,
    private jwtEncrypter: JwtEncrypter,
  ) {}

  async makePrismaUser(data: Partial<UserProps> = {}): Promise<User> {
    const user = makeUser(data);

    await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(user),
    });

    return user;
  }

  async makeToken(userId: string): Promise<string> {
    const token = await this.jwtEncrypter.encrypt({
      sub: userId,
    });

    return token;
  }
}
