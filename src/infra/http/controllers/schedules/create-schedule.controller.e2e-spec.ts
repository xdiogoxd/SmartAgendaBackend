import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { OrganizationFactory } from 'test/factories/make-organization';
import { UserFactory } from 'test/factories/make-user';

describe('Create schedule (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userFactory: UserFactory;
  let organizationFactory: OrganizationFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        JwtEncrypter,
        PrismaService,
        OrganizationFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    userFactory = moduleRef.get(UserFactory);
    organizationFactory = moduleRef.get(OrganizationFactory);

    await app.init();
  });

  test('[POST] /schedules - should be able to create a schedule', async () => {
    const user = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const response = await request(app.getHttpServer())
      .post('/schedules')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId: organization.id.toString(),
        days: [
          {
            weekDay: 0,
            startHour: 480,
            endHour: 1080,
          },
          {
            weekDay: 1,
            startHour: 480,
            endHour: 1080,
          },
          {
            weekDay: 2,
            startHour: 480,
            endHour: 1080,
          },
          {
            weekDay: 3,
            startHour: 480,
            endHour: 1080,
          },
          {
            weekDay: 4,
            startHour: 480,
            endHour: 1080,
          },
          {
            weekDay: 5,
            startHour: 480,
            endHour: 1080,
          },
          {
            weekDay: 6,
            startHour: 480,
            endHour: 1080,
          },
        ],
      });

    expect(response.statusCode).toBe(201);

    const schedule = await prisma.schedule.findMany({
      where: {
        organizationId: organization.id.toString(),
      },
    });

    expect(schedule).toHaveLength(7);
  });

  test('[POST] /schedules - should not be able to create a schedule with invalid hour range', async () => {
    const user = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const response = await request(app.getHttpServer())
      .post('/schedules')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId: organization.id.toString(),
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

  test('[POST] /schedules - should not be able to create a schedule with invalid week day', async () => {
    const user = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const response = await request(app.getHttpServer())
      .post('/schedules')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId: organization.id.toString(),
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
});
