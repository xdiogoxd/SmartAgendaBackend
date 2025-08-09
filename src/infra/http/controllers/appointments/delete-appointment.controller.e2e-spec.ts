import { AppModule } from '@/app.module';
import { AppointmentStatus } from '@/core/types/appointment-status-enum';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppointmentFactory } from 'test/factories/make-appointment';
import { OrganizationFactory } from 'test/factories/make-organization';
import { ServiceFactory } from 'test/factories/make-service';
import { SpaceOfServiceFactory } from 'test/factories/make-space-of-service';
import { UserFactory } from 'test/factories/make-user';

describe('Delete appointment (E2E)', () => {
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

  test('[DELETE] /appointments/:id/delete - should be able to delete an appointment', async () => {
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

    const response = await request(app.getHttpServer())
      .delete(`/appointments/${appointmentId}/delete`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
      });

    expect(response.statusCode).toBe(204);

    const deletedAppointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
    });

    expect(deletedAppointment).toBeNull();
  });

  test('[DELETE] /appointments/:id/delete - should not be able to delete a non-existing appointment', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .delete('/appointments/non-existing-id/delete')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
      });

    expect(response.statusCode).toBe(404);
  });

  test('[DELETE] /appointments/:id/delete - should not be able to delete a finished appointment', async () => {
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
      .delete(`/appointments/${appointmentId}/delete`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
      });

    expect(response.statusCode).toBe(400);
  });
});
