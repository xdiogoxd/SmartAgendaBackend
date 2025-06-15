import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ServiceFactory } from 'test/factories/make-service';
import { UserFactory } from 'test/factories/make-user';

describe('Create service (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userFactory: UserFactory;
  let serviceFactory: ServiceFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, JwtEncrypter, PrismaService, ServiceFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    userFactory = moduleRef.get(UserFactory);
    serviceFactory = moduleRef.get(ServiceFactory);

    await app.init();
  });

  test('[POST] /services - should be able to create a service', async () => {
    const { id } = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(id.toString());

    const response = await request(app.getHttpServer())
      .post('/services')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
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
    const { id } = await userFactory.makePrismaUser();

    const accessToken = await userFactory.makeToken(id.toString());

    await serviceFactory.makePrismaService({
      name: 'New Hair cut',
    });

    const response = await request(app.getHttpServer())
      .post('/services')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'New Hair cut',
        description: 'Hair cut description',
        price: 50,
        duration: 30,
        observations: 'Hair cut observations',
      });

    expect(response.statusCode).toBe(409);
  });
});
