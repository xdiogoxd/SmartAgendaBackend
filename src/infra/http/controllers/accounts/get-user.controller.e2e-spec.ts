import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

import { UserFactory } from 'test/factories/make-user';

import request from 'supertest';

describe('Get user (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userFactory: UserFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, JwtEncrypter, PrismaService],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    userFactory = moduleRef.get(UserFactory);

    await app.init();
  });

  test('[GET] /users - should be able to get an user information', async () => {
    const user = await userFactory.makePrismaUser({
      email: 'johndoe@example.com',
    });

    const accessToken = await userFactory.makeToken(user.id.toString());

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body.user).toEqual({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      createdAt: expect.any(String),
      updatedAt: null,
    });

    expect(user).toBeTruthy();
  });

  test('[GET] /users - should not be able to get an user information without authentication', async () => {
    const response = await request(app.getHttpServer()).get('/users');

    expect(response.statusCode).toBe(401);
  });
});
