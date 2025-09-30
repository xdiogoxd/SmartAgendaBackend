import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

import { UserFactory } from 'test/factories/make-user';

import request from 'supertest';

describe('Create organization (E2E)', () => {
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

  test('[POST] /organizations - should be able to create an organization', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const response = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Organization Test',
      });

    expect(response.statusCode).toBe(201);

    const organization = await prisma.organization.findFirst({
      where: {
        name: 'Organization Test',
      },
    });

    expect(organization).toBeTruthy();
    expect(organization.name).toBe('Organization Test');
  });

  test('[POST] /organizations - should not be able to create an organization without authentication', async () => {
    const response = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Organization Test',
      });

    expect(response.statusCode).toBe(401);
  });

  test('[POST] /organizations - should not be able to create an organization without required fields', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const response = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(response.statusCode).toBe(400);
  });

  test('[POST] /organizations - should not be able to create an organization with duplicated name', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Organization Test',
      });

    const response = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Organization Test',
      });

    console.log(response.body);

    expect(response.statusCode).toBe(409);
  });
});
