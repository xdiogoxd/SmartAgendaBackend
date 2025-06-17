import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import request from 'supertest';
import { ServiceFactory } from 'test/factories/make-service';
import { AppModule } from '@/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { UserFactory } from 'test/factories/make-user';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { OrganizationFactory } from 'test/factories/make-organization';

describe('Update Service (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userFactory: UserFactory;
  let organizationFactory: OrganizationFactory;
  let serviceFactory: ServiceFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        JwtEncrypter,
        PrismaService,
        OrganizationFactory,
        ServiceFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    userFactory = moduleRef.get(UserFactory);
    organizationFactory = moduleRef.get(OrganizationFactory);
    serviceFactory = moduleRef.get(ServiceFactory);

    await app.init();
  });

  test('[PATCH] /services/id/:id', async () => {
    const user = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization(
      {},
      user.id,
    );

    const service = await serviceFactory.makePrismaService({}, organization.id);

    const response = await request(app.getHttpServer())
      .patch(`/services/id/${service.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Service',
        description: 'Updated Description',
        price: 150,
        duration: 60,
        observations: 'Updated observations',
      });

    expect(response.status).toBe(200);

    const serviceOnDatabase = await prisma.service.findFirst({
      where: {
        name: 'Updated Service',
      },
    });

    expect(serviceOnDatabase).toBeTruthy();
    expect(serviceOnDatabase?.description).toBe('Updated Description');
  });

  test('[PATCH] /services/id/:id (service not found)', async () => {
    const user = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(user.id.toString());

    const response = await request(app.getHttpServer())
      .patch('/services/id/invalid-id')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Service',
        description: 'Updated Description',
        price: 150,
        duration: 60,
        observations: 'Updated observations',
      });

    expect(response.status).toBe(404);
  });

  test('[PATCH] /services/id/:id (invalid body)', async () => {
    const user = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization(
      {},
      user.id,
    );

    const service = await serviceFactory.makePrismaService({}, organization.id);

    const response = await request(app.getHttpServer())
      .patch(`/services/id/${service.id}`)
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
