import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';

import { OrganizationFactory } from 'test/factories/make-organization';
import { SpaceOfServiceFactory } from 'test/factories/make-space-of-service';
import { UserFactory } from 'test/factories/make-user';

import request from 'supertest';

describe('Find spaceofservice by id (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let organizationFactory: OrganizationFactory;
  let spaceofserviceFactory: SpaceOfServiceFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        OrganizationFactory,
        JwtEncrypter,
        SpaceOfServiceFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    userFactory = moduleRef.get(UserFactory);
    organizationFactory = moduleRef.get(OrganizationFactory);
    spaceofserviceFactory = moduleRef.get(SpaceOfServiceFactory);

    await app.init();
  });

  test('[GET] /organizations/:organizationId/spaceofservices/id/:spaceofserviceId - should be able to get a spaceofservice by id', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const spaceofservice = await spaceofserviceFactory.makePrismaSpaceOfService(
      {
        name: 'Space 1',
        organizationId: organization.id,
      },
    );

    const organizationId = organization.id.toString();
    const spaceofserviceId = spaceofservice.id.toString();

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organizationId}/spaceofservices/id/${spaceofserviceId}`,
      )
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      spaceOfService: expect.objectContaining({
        name: 'Space 1',
      }),
    });
  });

  test('[GET] /organizations/:organizationId/spaceofservices/id/:spaceofserviceId - should not be able to get a non-existing spaceofservice', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organizationId}/spaceofservices/id/non-existing-id`,
      )
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });
});
