import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { OrganizationFactory } from 'test/factories/make-organization';
import { ServiceFactory } from 'test/factories/make-service';
import { UserFactory } from 'test/factories/make-user';

describe('Find service by name (E2E)', () => {
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

  test('[GET] /services/name/:name - should be able to get a service by name', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const service = await serviceFactory.makePrismaService({
      name: 'Hair cut',
      organizationId: organization.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/services/name/${service.name}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId: organization.id.toString(),
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      service: expect.objectContaining({
        id: service.id.toString(),
        name: 'Hair cut',
      }),
    });
  });

  test('[GET] /services/name/:name - should not be able to get a non-existing service', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const response = await request(app.getHttpServer())
      .get('/services/name/non-existing-service')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId: organization.id.toString(),
      });

    expect(response.statusCode).toBe(400);
  });
});
