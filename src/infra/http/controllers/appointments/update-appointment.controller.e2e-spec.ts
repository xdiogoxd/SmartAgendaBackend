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
import request from 'supertest';

describe('Update appointment (E2E)', () => {
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

  test('[PATCH] organizations/:organizationId/appointments/:id - should be able to update an appointment', async () => {
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

    const appointment = await appointmentFactory.makePrismaAppointment({
      organizationId: organization.id,
      spaceOfServiceId: spaceOfService.id,
      serviceId: service.id,
      customerId: customer.id,
    });

    const organizationId = organization.id.toString();

    const appointmentId = appointment.id.toString();

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        description: 'Updated description',
        observations: 'Updated observations',
        serviceId: service.id.toString(),
        spaceOfServiceId: spaceOfService.id.toString(),
        customerPhone: customer.phone,
      });

    expect(response.statusCode).toBe(200);
  });

  test('[PATCH] /organizations/:organizationId/appointments/:id - should not be able to update a non-existing appointment', async () => {
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

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}/appointments/non-existing-id`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        description: 'Updated description',
        observations: 'Updated observations',
        serviceId: service.id.toString(),
        spaceOfServiceId: spaceOfService.id.toString(),
        customerPhone: faker.phone.number(),
      });

    expect(response.statusCode).toBe(404);
  });
});
