import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

import { AppointmentFactory } from 'test/factories/make-appointment';
import { CustomerFactory } from 'test/factories/make-customer';
import { OrganizationFactory } from 'test/factories/make-organization';
import { ServiceFactory } from 'test/factories/make-service';
import { SpaceOfServiceFactory } from 'test/factories/make-space-of-service';
import { UserFactory } from 'test/factories/make-user';

import { faker } from '@faker-js/faker';
import { addDays, endOfMonth, getMonth, getYear, startOfMonth } from 'date-fns';
import request from 'supertest';

describe('List appointments by month (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userFactory: UserFactory;
  let organizationFactory: OrganizationFactory;
  let customerFactory: CustomerFactory;
  let spaceOfServiceFactory: SpaceOfServiceFactory;
  let serviceFactory: ServiceFactory;
  let appointmentFactory: AppointmentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        OrganizationFactory,
        CustomerFactory,
        SpaceOfServiceFactory,
        ServiceFactory,
        AppointmentFactory,
        JwtEncrypter,
        PrismaService,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    userFactory = moduleRef.get(UserFactory);
    organizationFactory = moduleRef.get(OrganizationFactory);
    customerFactory = moduleRef.get(CustomerFactory);
    spaceOfServiceFactory = moduleRef.get(SpaceOfServiceFactory);
    serviceFactory = moduleRef.get(ServiceFactory);
    appointmentFactory = moduleRef.get(AppointmentFactory);

    await app.init();
  });

  test('[GET] /organizations/:organizationId/appointments/list/:month/:year - should be able to list appointments by month', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const customer = await customerFactory.makePrismaCustomer({
      organizationId: organization.id,
    });

    const spaceOfService = await spaceOfServiceFactory.makePrismaSpaceOfService(
      {
        organizationId: organization.id,
      },
    );

    const service = await serviceFactory.makePrismaService({
      organizationId: organization.id,
    });

    const date = faker.date.future();

    const firstDay = startOfMonth(date);

    const month = getMonth(date) + 1;
    const year = getYear(date);

    const date1 = addDays(firstDay, 1);
    const date2 = addDays(firstDay, 2);
    const date3 = addDays(firstDay, 3);
    const date4 = addDays(firstDay, 4);

    await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      customerId: customer.id,
      date: date1,
    });

    await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      customerId: customer.id,
      date: date2,
    });

    await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      customerId: customer.id,
      date: date3,
    });

    await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      customerId: customer.id,
      date: date4,
    });

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organization.id.toString()}/appointments/monthYear/${month}/${year}`,
      )
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.appointments.length).toBe(4);
  });

  test('[GET] /organizations/:organizationId/appointments/list/:month/:year - should not be able to list appointments without required fields', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());
    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organization.id.toString()}/appointments/monthYear/invalid/invalid`,
      )
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });

  test('[GET] /organizations/:organizationId/appointments/list/:month/:year - should not be able to list appointments with invalid month', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());
    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const month = 13;
    const year = 2024;

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organization.id.toString()}/appointments/monthYear/${month}/${year}`,
      )
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });
});
