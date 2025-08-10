import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { OrganizationFactory } from 'test/factories/make-organization';
import { SpaceOfServiceFactory } from 'test/factories/make-space-of-service';
import { UserFactory } from 'test/factories/make-user';

describe('Find spaceOfService by name (E2E)', () => {
  let app: INestApplication;

  let userFactory: UserFactory;
  let organizationFactory: OrganizationFactory;
  let spaceOfServiceFactory: SpaceOfServiceFactory;

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
    spaceOfServiceFactory = moduleRef.get(SpaceOfServiceFactory);

    await app.init();
  });

  test('[GET] /organizations/:organizationId/spaceofservices/name/:spaceofserviceName - should be able to get a spaceOfService by name', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const spaceOfService = await spaceOfServiceFactory.makePrismaSpaceOfService(
      {
        name: 'Space 1',
        organizationId: organization.id,
      },
    );

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organizationId}/spaceofservices/name/${spaceOfService.name}`,
      )
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      spaceOfService: expect.objectContaining({
        name: 'Space 1',
      }),
    });
  });

  test('[GET] /organizations/:organizationId/spaceofservices/name/:spaceofserviceName - should not be able to get a non-existing spaceOfService', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organizationId}/spaceofservices/name/non-existing-spaceOfService`,
      )
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });
});
