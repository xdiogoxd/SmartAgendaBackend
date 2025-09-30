import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

import { CustomerFactory } from 'test/factories/make-customer';
import { OrganizationFactory } from 'test/factories/make-organization';
import { UserFactory } from 'test/factories/make-user';

import request from 'supertest';

describe('Get all customers by organization (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userFactory: UserFactory;
  let customerFactory: CustomerFactory;
  let organizationFactory: OrganizationFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        CustomerFactory,
        OrganizationFactory,
        PrismaService,
        JwtEncrypter,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    userFactory = moduleRef.get(UserFactory);
    customerFactory = moduleRef.get(CustomerFactory);
    organizationFactory = moduleRef.get(OrganizationFactory);

    await app.init();
  });

  test('[GET] /organizations/:organizationId/customers/name/:name - should be able to get all customers by name and organization', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());
    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });
    const name = 'John Doe';

    const customer = await customerFactory.makePrismaCustomer({
      organizationId: organization.id,
      name,
    });

    await customerFactory.makePrismaCustomer({
      organizationId: organization.id,
      name: 'Jane Doe',
    });

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id.toString()}/customers/name/Doe`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.customers).toHaveLength(2);
    expect(response.body.customers[0]).toMatchObject({
      id: customer.id.toString(),
    });
  });

  test('[GET] /organizations/:organizationId/customers/name/:name - should return a empty for no customers match', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());
    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id.toString()}/customers/name/Doe`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.customers).toHaveLength(0);
  });

  test('[GET] /organizations/:organizationId/customers/name/:name - should return 404 in non existing organization', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const response = await request(app.getHttpServer())
      .get(`/organizations/999999/customers/name/Doe`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });
});
