import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { OrganizationFactory } from 'test/factories/make-organization';
import { SpaceOfServiceFactory } from 'test/factories/make-space-of-service';

import { UserFactory } from 'test/factories/make-user';

describe('Create spaceofservice (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userFactory: UserFactory;
  let organizationFactory: OrganizationFactory;
  let spaceofserviceFactory: SpaceOfServiceFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        JwtEncrypter,
        PrismaService,
        OrganizationFactory,
        SpaceOfServiceFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    userFactory = moduleRef.get(UserFactory);
    organizationFactory = moduleRef.get(OrganizationFactory);
    spaceofserviceFactory = moduleRef.get(SpaceOfServiceFactory);

    await app.init();
  });

  test('[POST] /organizations/:organizationId/spaceofservices - should be able to create a spaceofservice', async () => {
    const user = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/spaceofservices`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
        name: 'Hair cut',
        description: 'Hair cut description',
      });

    expect(response.statusCode).toBe(201);

    const spaceOfService = await prisma.spaceOfService.findFirst({
      where: {
        name: 'Hair cut',
      },
    });

    expect(spaceOfService).toBeTruthy();
  });

  test('[POST] /organizations/:organizationId/spaceofservices - should not be able to create a spaceofservice with a name already used', async () => {
    const user = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const spaceOfService = await spaceofserviceFactory.makePrismaSpaceOfService(
      {
        organizationId: organization.id,
        name: 'Space 1',
      },
    );

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/spaceofservices`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
        name: 'Space 1',
        description: 'Space 1 description',
      });

    expect(response.statusCode).toBe(409);
  });
});
