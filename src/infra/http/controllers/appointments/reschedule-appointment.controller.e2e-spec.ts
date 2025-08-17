import { AppModule } from '@/app.module';
import { AppointmentStatus } from '@/core/types/appointment-status-enum';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppointmentFactory } from 'test/factories/make-appointment';
import { OrganizationFactory } from 'test/factories/make-organization';
import { ServiceFactory } from 'test/factories/make-service';
import { SpaceOfServiceFactory } from 'test/factories/make-space-of-service';
import { UserFactory } from 'test/factories/make-user';

describe('Reschedule appointment (E2E)', () => {
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

  test('[PATCH] /organizations/:organizationId/appointments/:id/reschedule - should be able to reschedule an appointment', async () => {
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

    const appointment = await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      clientId: user.id,
    });

    const organizationId = organization.id.toString();

    const appointmentId = appointment.id.toString();

    const date = faker.date.future();

    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organizationId}/appointments/${appointmentId}/reschedule`,
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        date,
      });

    expect(response.statusCode).toBe(200);

    const rescheduleedAppointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
    });

    expect(rescheduleedAppointment).toBeTruthy();
    expect(rescheduleedAppointment.date).toEqual(date);
  });

  test('[PATCH] /organizations/:organizationId/appointments/:id/reschedule - should not be able to reschedule a non-existing appointment', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organizationId = organization.id.toString();

    const date = faker.date.future();

    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organizationId}/appointments/non-existing-id/reschedule`,
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        date,
      });

    expect(response.statusCode).toBe(404);
  });

  test('[PATCH] /organizations/:organizationId/appointments/:id/reschedule - should not be able to reschedule an completed appointement', async () => {
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

    const appointment = await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      clientId: user.id,
      status: AppointmentStatus.FINISHED,
      finishedAt: new Date(),
    });

    const organizationId = organization.id.toString();

    const appointmentId = appointment.id.toString();

    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organizationId}/appointments/${appointmentId}/reschedule`,
      )
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });

  test('[PATCH] /organizations/:organizationId/appointments/:id/reschedule - should not be able to reschedule with date already taken', async () => {
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

    const unUsedDate = date;

    unUsedDate.setDate(unUsedDate.getDate() + 1);

    const appointment1 = await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      clientId: user.id,
      date,
    });

    const appointment2 = await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      clientId: user.id,
      date: unUsedDate,
    });

    const organizationId = organization.id.toString();
    const appointment1Id = appointment1.id.toString();

    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organizationId}/appointments/${appointment1Id}/reschedule`,
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        date,
      });

    expect(response.statusCode).toBe(409);
  });
});
