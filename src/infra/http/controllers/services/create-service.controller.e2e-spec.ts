import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { OrganizationFactory } from 'test/factories/make-organization';
import { ServiceFactory } from 'test/factories/make-service';
import { UserFactory } from 'test/factories/make-user';

describe('Create service (E2E)', () => {
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

  test('[POST] /services - should be able to create a service', async () => {
    const user = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .post('/services')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
        name: 'Hair cut',
        description: 'Hair cut description',
        price: 50,
        duration: 30,
        observations: 'Hair cut observations',
      });

    expect(response.statusCode).toBe(201);

    const service = await prisma.service.findFirst({
      where: {
        name: 'Hair cut',
      },
    });

    expect(service).toBeTruthy();
  });

  test('[POST] /services - should not be able to create a service with a name already used', async () => {
    const user = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    await serviceFactory.makePrismaService({
      name: 'New Hair cut',
      organizationId: organization.id,
    });

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .post('/services')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
        name: 'New Hair cut',
        description: 'Hair cut description',
        price: 50,
        duration: 30,
        observations: 'Hair cut observations',
      });

    expect(response.statusCode).toBe(409);
  });
});
