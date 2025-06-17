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

describe('List all services (E2E)', () => {
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
        OrganizationFactory,
        JwtEncrypter,
        PrismaService,
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

  test('[GET] /services - should be able to list services from specific organization', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization1 = await organizationFactory.makePrismaOrganization(
      {},
      user.id,
    );

    const organization2 = await organizationFactory.makePrismaOrganization(
      {},
      user.id,
    );

    await serviceFactory.makePrismaService(
      {
        name: 'Hair cut',
      },
      organization1.id,
    );
    await serviceFactory.makePrismaService(
      {
        name: 'Hair cut2',
      },
      organization1.id,
    );

    await serviceFactory.makePrismaService(
      {
        name: 'Beard trim',
      },
      organization2.id,
    );

    const organizationId = organization1.id.toString();

    const response = await request(app.getHttpServer())
      .get('/services')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.services).toHaveLength(2);
    expect(response.body).toEqual({
      services: expect.arrayContaining([
        expect.objectContaining({ name: 'Hair cut' }),
      ]),
    });

    //   expect(response.body).toEqual({
    // answers: expect.arrayContaining([
    //   expect.objectContaining({ content: 'Answer 01' }),
    //   expect.objectContaining({ content: 'Answer 01' }),
    // ]),
  });

  test('[GET] /services - should not be able to list services from non-existing organization', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const response = await request(app.getHttpServer())
      .get('/services')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId: 'non-existing-id',
      });

    expect(response.statusCode).toBe(400);
  });

  test('[GET] /services - should return a empty array if organization has no services', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization(
      {},
      user.id,
    );

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .get('/services')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.services).toHaveLength(0);
  });
});
