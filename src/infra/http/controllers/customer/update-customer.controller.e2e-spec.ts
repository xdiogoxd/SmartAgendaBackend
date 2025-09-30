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

describe('Update customer (E2E)', () => {
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

  test('[PATCH] /organizations/:organizationId/customer/:customerId - should be able to update an customer', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());
    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const customer = await customerFactory.makePrismaCustomer({
      organizationId: organization.id,
      phone: faker.phone.number(),
    });
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organization.id.toString()}/customers/id/${customer.id.toString()}`,
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'John Doe',
        phone: faker.phone.number(),
      });

    expect(response.statusCode).toBe(200);

    console.log(response.body);

    const checkCustomer = await prisma.customer.findUnique({
      where: { id: response.body.customer.id },
    });

    expect(checkCustomer).toBeTruthy();
  });

  test('[PATCH] /organizations/:organizationId/customers - should not be able to patch an customer with already used phone number', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());
    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const phone = faker.phone.number();

    await customerFactory.makePrismaCustomer({
      organizationId: organization.id,
      phone,
    });

    const customer = await customerFactory.makePrismaCustomer({
      organizationId: organization.id,
      phone: faker.phone.number(),
    });
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organization.id.toString()}/customers/id/${customer.id.toString()}`,
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'John Doe',
        phone,
      });

    console.log(response.body);

    expect(response.statusCode).toBe(409);
  });

  test('[PATCH] /organizations/:organizationId/customers - should not be able to create an customer in non existing organization', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const response = await request(app.getHttpServer())
      .patch(`/organizations/999999/customers/id/non-existing-customer-id`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'John Doe',
        phone: faker.phone.number(),
      });

    expect(response.statusCode).toBe(404);
  });
});
