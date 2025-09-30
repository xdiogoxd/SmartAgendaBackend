import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

import { OrganizationFactory } from 'test/factories/make-organization';
import { UserFactory } from 'test/factories/make-user';

import request from 'supertest';

describe('Update organization (E2E)', () => {
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

  test('[PATCH] /organizations/:organizationId - should be able to update an organization', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organization.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'New Organization Name',
      });

    expect(response.statusCode).toBe(200);

    const updatedOrganization = await prisma.organization.findFirst({
      where: {
        id: organization.id.toString(),
      },
    });

    expect(updatedOrganization).toBeTruthy();
    expect(updatedOrganization.name).toBe('New Organization Name');
  });

  test('[PATCH] /organizations/:organizationId - should not be able to update an organization without authentication', async () => {
    const response = await request(app.getHttpServer())
      .patch('/organizations/any-id')
      .send({
        name: 'New Organization Name',
      });

    expect(response.statusCode).toBe(401);
  });

  test('[PATCH] /organizations/:organizationId - should not be able to update an organization with duplicated name', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    await organizationFactory.makePrismaOrganization({
      name: 'Existing Organization',
      ownerId: user.id,
    });

    const organizationToUpdate =
      await organizationFactory.makePrismaOrganization({
        name: 'Different Organization',
        ownerId: user.id,
      });

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationToUpdate.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Existing Organization',
      });

    expect(response.statusCode).toBe(409);
  });
});
