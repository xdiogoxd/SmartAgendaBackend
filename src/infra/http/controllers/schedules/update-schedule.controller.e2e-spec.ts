import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

import { OrganizationFactory } from 'test/factories/make-organization';
import { ScheduleFactory } from 'test/factories/make-schedule';
import { UserFactory } from 'test/factories/make-user';

import request from 'supertest';

describe('Update schedule (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userFactory: UserFactory;
  let organizationFactory: OrganizationFactory;
  let scheduleFactory: ScheduleFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        JwtEncrypter,
        PrismaService,
        OrganizationFactory,
        ScheduleFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    userFactory = moduleRef.get(UserFactory);
    organizationFactory = moduleRef.get(OrganizationFactory);
    scheduleFactory = moduleRef.get(ScheduleFactory);

    await app.init();
  });

  test('[PUT] /schedules - should be able to update a schedule', async () => {
    const user = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(user.id.toString());
    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    // Create initial schedule
    await scheduleFactory.makePrismaSchedule({
      organizationId: organization.id,
    });

    const organizationId = organization.id.toString();

    // Update schedule
    const response = await request(app.getHttpServer())
      .put('/schedules')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
        days: [
          {
            weekDay: 0,
            startHour: 540,
            endHour: 1140,
          },
        ],
      });

    expect(response.statusCode).toBe(200);

    const schedule = await prisma.schedule.findFirst({
      where: {
        organizationId: organization.id.toString(),
        weekDay: 0,
      },
    });

    expect(schedule?.startHour).toBe(540);
    expect(schedule?.endHour).toBe(1140);
  });

  test('[PUT] /schedules - should not be able to update a schedule with invalid hour range', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());
    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .put('/schedules')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
        days: [
          {
            weekDay: 1,
            startHour: 1080,
            endHour: 480,
          },
        ],
      });

    expect(response.statusCode).toBe(400);
  });

  test('[PUT] /schedules - should not be able to update a schedule with invalid week day', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());
    const organization = await organizationFactory.makePrismaOrganization({
      name: 'Organization 1',
      ownerId: user.id,
    });

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .put('/schedules')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
        days: [
          {
            weekDay: 7,
            startHour: 480,
            endHour: 1080,
          },
        ],
      });

    expect(response.statusCode).toBe(400);
  });

  test('[PUT] /schedules - should not be able to update a schedule for non-existent organization', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const response = await request(app.getHttpServer())
      .put('/schedules')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId: 'non-existent-id',
        days: [
          {
            weekDay: 0,
            startHour: 480,
            endHour: 1080,
          },
        ],
      });

    expect(response.statusCode).toBe(404);
  });
});
