import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { addDays, endOfMonth, startOfMonth } from 'date-fns';
import request from 'supertest';
import { AppointmentFactory } from 'test/factories/make-appointment';
import { OrganizationFactory } from 'test/factories/make-organization';
import { ServiceFactory } from 'test/factories/make-service';
import { SpaceOfServiceFactory } from 'test/factories/make-space-of-service';
import { UserFactory } from 'test/factories/make-user';

describe('List appointments by date range (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userFactory: UserFactory;
  let organizationFactory: OrganizationFactory;
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
        JwtEncrypter,
        PrismaService,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    userFactory = moduleRef.get(UserFactory);
    organizationFactory = moduleRef.get(OrganizationFactory);
    spaceOfServiceFactory = moduleRef.get(SpaceOfServiceFactory);
    serviceFactory = moduleRef.get(ServiceFactory);
    appointmentFactory = moduleRef.get(AppointmentFactory);

    await app.init();
  });

  test('[GET] /appointments/list/:organizationId/date - should be able to list appointments by date range', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
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

    await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      clientId: user.id,
      date: firstDay,
    });

    await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      clientId: user.id,
      date: addDays(firstDay, 1),
    });

    await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      clientId: user.id,
      date: addDays(firstDay, 2),
    });

    await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      clientId: user.id,
      date: addDays(firstDay, 3),
    });

    const response = await request(app.getHttpServer())
      .get(`/appointments/list/${organization.id.toString()}/date`)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        startDate,
        endDate,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.appointments.length).toBe(4);
  });

  test('[GET] /appointments/list/:organizationId/date - should not be able to list appointments without required fields', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());
    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/appointments/list/${organization.id.toString()}/date`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(response.statusCode).toBe(400);
  });

  test('[GET] /appointments/list/:organizationId/date - should not be able to list appointments with invalid date range', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());
    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 7); // End date before start date

    const response = await request(app.getHttpServer())
      .get(`/appointments/list/${organization.id.toString()}/date`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        startDate,
        endDate,
      });

    expect(response.statusCode).toBe(400);
  });
});
