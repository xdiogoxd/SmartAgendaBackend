import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import request from 'supertest';

import { AppModule } from '@/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { UserFactory } from 'test/factories/make-user';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { OrganizationFactory } from 'test/factories/make-organization';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { SpaceOfServiceFactory } from 'test/factories/make-space-of-service';

describe('Update SpaceOfService (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userFactory: UserFactory;
  let organizationFactory: OrganizationFactory;
  let spaceOfServiceFactory: SpaceOfServiceFactory;

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
    spaceOfServiceFactory = moduleRef.get(SpaceOfServiceFactory);

    await app.init();
  });

  test('[PATCH] /spaceOfServices/id/:id', async () => {
    const user = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organizationId = organization.id.toString();

    const spaceOfService = await spaceOfServiceFactory.makePrismaSpaceOfService(
      {
        name: 'Hair cut',
        organizationId: organization.id,
      },
    );

    const response = await request(app.getHttpServer())
      .patch(`/spaceOfServices/id/${spaceOfService.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
        name: 'Updated SpaceOfService',
        description: 'Updated Description',
        price: 150,
        duration: 60,
        observations: 'Updated observations',
      });

    expect(response.status).toBe(200);

    const spaceOfServiceOnDatabase = await prisma.spaceOfService.findFirst({
      where: {
        name: 'Updated SpaceOfService',
      },
    });

    expect(spaceOfServiceOnDatabase).toBeTruthy();
    expect(spaceOfServiceOnDatabase?.description).toBe('Updated Description');
  });

  test('[PATCH] /spaceOfServices/id/:id (spaceOfService not found)', async () => {
    const user = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .patch('/spaceOfServices/id/invalid-id')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
        name: 'Updated SpaceOfService',
        description: 'Updated Description',
        price: 150,
        duration: 60,
        observations: 'Updated observations',
      });

    expect(response.status).toBe(404);
  });

  test('[PATCH] /spaceOfServices/id/:id (invalid body)', async () => {
    const user = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const spaceOfService = await spaceOfServiceFactory.makePrismaSpaceOfService(
      {
        name: 'Hair cut',
        organizationId: organization.id,
      },
    );

    const response = await request(app.getHttpServer())
      .patch(`/spaceOfServices/id/${spaceOfService.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: '',
        description: '',
        price: 'invalid-price',
        duration: 'invalid-duration',
      });

    expect(response.status).toBe(400);
  });
});
