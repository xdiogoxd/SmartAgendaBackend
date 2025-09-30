import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

import { UserFactory } from 'test/factories/make-user';

import { hash } from 'bcryptjs';
import request from 'supertest';

describe('Authenticate account (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, PrismaService, JwtEncrypter],
    }).compile();

    app = moduleRef.createNestApplication();

    userFactory = moduleRef.get(UserFactory);

    await app.init();
  });

  test('[POST] /sessions', async () => {
    const email = 'johndoe@example.com';
    const password = await hash('123456', 8);

    await userFactory.makePrismaUser({
      email,
      password,
    });

    const response = await request(app.getHttpServer()).post('/sessions').send({
      email,
      password: '123456',
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      access_token: expect.any(String),
    });
  });
  test('[POST] /sessions - Invalid credentials', async () => {
    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: 'johndoe@example.com',
      password: '1234567',
    });

    expect(response.statusCode).toBe(401);
  });
});
