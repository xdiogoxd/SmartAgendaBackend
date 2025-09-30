import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';

import { OrganizationFactory } from 'test/factories/make-organization';
import { ServiceFactory } from 'test/factories/make-service';
import { UserFactory } from 'test/factories/make-user';

import request from 'supertest';

describe('List all services (E2E)', () => {
  let app: INestApplication;

  let userFactory: UserFactory;
  let organizationFactory: OrganizationFactory;
  let serviceFactory: ServiceFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        OrganizationFactory,
        JwtEncrypter,

        ServiceFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    userFactory = moduleRef.get(UserFactory);
    organizationFactory = moduleRef.get(OrganizationFactory);
    serviceFactory = moduleRef.get(ServiceFactory);

    await app.init();
  });

  test('[GET] /organizations/:organizationId/services - should be able to list services from specific organization', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization1 = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organization2 = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    await serviceFactory.makePrismaService({
      organizationId: organization1.id,
      name: 'Hair cut',
    });
    await serviceFactory.makePrismaService({
      organizationId: organization1.id,
      name: 'Hair cut2',
    });

    await serviceFactory.makePrismaService({
      organizationId: organization2.id,
      name: 'Beard trim',
    });

    const organizationId = organization1.id.toString();

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/services`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.services).toHaveLength(2);
    expect(response.body).toEqual({
      services: expect.arrayContaining([
        expect.objectContaining({ name: 'Hair cut' }),
      ]),
    });
  });

  test('[GET] /organizations/:organizationId/services - should not be able to list services from non-existing organization', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const response = await request(app.getHttpServer())
      .get('/organizations/non-existing-id/services')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });

  test('[GET] /organizations/:organizationId/services - should return a empty array if organization has no services', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/services`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.services).toHaveLength(0);
  });
});
