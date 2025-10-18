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
import { addDays, endOfMonth, startOfMonth } from 'date-fns';
import request from 'supertest';

describe('List appointment by ID (E2E)', () => {
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
        SpaceOfServiceFactory,
        ServiceFactory,
        AppointmentFactory,
        CustomerFactory,
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

  test('[GET] /organizations/:organizationId/appointments/id/:appointmentId - should be able to list appointments by date range', async () => {
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

    const startDate = firstDay;
    const endDate = endOfMonth(date);

    const theAppointment = await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      customerId: customer.id,
      date: firstDay,
    });

    await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      customerId: customer.id,
      date: addDays(firstDay, 1),
    });

    await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      customerId: customer.id,
      date: addDays(firstDay, 2),
    });

    await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      customerId: customer.id,
      date: addDays(firstDay, 3),
    });

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organizationId}/appointments/id/${theAppointment.id.toString()}`,
      )
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.appointment.id).toBe(theAppointment.id.toString());
  });

  test('[GET] /organizations/:organizationId/appointments/id/:appointmentId - should not be able to find an appointment with invalid id', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());
    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/appointments/id/invalid-id`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });

  test('[GET] /organizations/:organizationId/appointments/id/:appointmentId - should not be able to find an appointment from another organization', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());
    const organization1 = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organization2 = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const service = await serviceFactory.makePrismaService({
      organizationId: organization2.id,
    });

    const customer = await customerFactory.makePrismaCustomer({
      organizationId: organization2.id,
    });

    const spaceOfService = await spaceOfServiceFactory.makePrismaSpaceOfService(
      {
        organizationId: organization2.id,
      },
    );

    const appointment = await appointmentFactory.makePrismaAppointment({
      organizationId: organization2.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      customerId: customer.id,
    });

    //Using organization 1 to try to access appointment from organization 2
    const organizationId = organization1.id.toString();

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 7); // End date before start date

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organizationId}/appointments/id/${appointment.id.toString()}`,
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

    expect(response.statusCode).toBe(404);
  });
});
