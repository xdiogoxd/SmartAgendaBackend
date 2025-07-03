import { AppModule } from '@/app.module';
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

describe('Create appointment (E2E)', () => {
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

  test('[POST] /appointments - should be able to create an appointment', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organizationId = organization.id;

    const spaceOfService = await spaceOfServiceFactory.makePrismaSpaceOfService(
      {
        organizationId,
      },
    );

    const spaceOfServiceId = spaceOfService.id.toString();

    const service = await serviceFactory.makePrismaService({
      organizationId,
    });

    const serviceId = service.id.toString();

    const date = faker.date.future();

    const response = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        date,
        description: 'Appointment Test',
        observations: 'Appointment Test',
        organizationId: organizationId.toString(),
        serviceId: serviceId.toString(),
        spaceOfServiceId: spaceOfServiceId.toString(),
        clientId: user.id.toString(),
      });

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: response.body.id,
      },
    });

    expect(appointment).toBeTruthy();
    expect(appointment.description).toBe('Appointment Test');
  });

  test('[POST] /appointments - should not be able to create an appointment without authentication', async () => {
    const response = await request(app.getHttpServer())
      .post('/appointments')
      .send({
        name: 'Appointment Test',
      });

    expect(response.statusCode).toBe(401);
  });

  test('[POST] /appointments - should not be able to create an appointment without required fields', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const response = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(response.statusCode).toBe(400);
  });

  test('[POST] /appointments - should not be able to create an appointment with duplicated date', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organizationId = organization.id;

    const spaceOfService = await spaceOfServiceFactory.makePrismaSpaceOfService(
      {
        organizationId,
      },
    );

    const spaceOfServiceId = spaceOfService.id;

    const service = await serviceFactory.makePrismaService({
      organizationId,
    });

    const serviceId = service.id;

    const date = faker.date.future();

    await appointmentFactory.makePrismaAppointment({
      organizationId,
      serviceId,
      date,
      spaceOfServiceId,
      clientId: user.id,
    });

    await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        date,
        description: 'Appointment Test',
        observations: 'Appointment Test',
        organizationId: organizationId.toString(),
        serviceId: serviceId.toString(),
        spaceOfServiceId: spaceOfServiceId.toString(),
        clientId: user.id.toString(),
      });

    const response = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        date,
        description: 'Appointment Test',
        observations: 'Appointment Test',
        organizationId: organizationId.toString(),
        serviceId: serviceId.toString(),
        spaceOfServiceId: spaceOfServiceId.toString(),
        clientId: user.id.toString(),
      });

    expect(response.statusCode).toBe(409);
  });
});
