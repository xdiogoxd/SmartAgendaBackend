import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

import { CustomerFactory } from 'test/factories/make-customer';
import { OrganizationFactory } from 'test/factories/make-organization';
import { UserFactory } from 'test/factories/make-user';

import { faker } from '@faker-js/faker';
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

  test('[GET] /organizations/:organizationId/customers/phone/:phone - should be able to get an customer that exists', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());
    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });
    const customer = await customerFactory.makePrismaCustomer({
      organizationId: organization.id,
    });
    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organization.id}/customers/phone/${customer.phone}`,
      )
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.customer).toBeTruthy();
    expect(response.body.customer).toMatchObject({
      id: customer.id.toString(),
    });
  });

  test('[GET] /organizations/:organizationId/customers/phone/:phone - should return 404 for non existing customer', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());
    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const phone = faker.phone.number();

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/customers/phone/${phone}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });

  test('[GET] /organizations/:organizationId/customers - should return 404 in non existing organization', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const phone = faker.phone.number();

    const response = await request(app.getHttpServer())
      .get(`/organizations/999999/customers/phone/${phone}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });
});
