import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

import { OrganizationFactory } from 'test/factories/make-organization';
import { UserFactory } from 'test/factories/make-user';

import request from 'supertest';

describe('Get all organizations by user (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userFactory: UserFactory;
  let organizationFactory: OrganizationFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        JwtEncrypter,
        OrganizationFactory,
        PrismaService,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    organizationFactory = moduleRef.get(OrganizationFactory);
    userFactory = moduleRef.get(UserFactory);

    await app.init();
  });

  test('[GET] /organizations - should be able to get all organizations by user', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });
    const organization2 = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const response = await request(app.getHttpServer())
      .get('/organizations/')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body.organizations.length).toBe(2);
  });

  test('[GET] /organizations/:organizationId - should not be able to get an organization without authentication', async () => {
    const response = await request(app.getHttpServer()).get('/organizations/');

    expect(response.statusCode).toBe(401);
  });

  test('[GET] /organizations/ - should receive an empty array for user without any organization', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const response = await request(app.getHttpServer())
      .get('/organizations/')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body.organizations.length).toBe(0);
  });
});
