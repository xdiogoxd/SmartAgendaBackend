import { AppModule } from '@/app.module';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encryptor';
import { DatabaseModule } from '@/infra/database/database.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { OrganizationFactory } from 'test/factories/make-organization';
import { SpaceOfServiceFactory } from 'test/factories/make-space-of-service';

import { UserFactory } from 'test/factories/make-user';

describe('List all spaceOfServices (E2E)', () => {
  let app: INestApplication;

  let userFactory: UserFactory;
  let organizationFactory: OrganizationFactory;
  let spaceofserviceFactory: SpaceOfServiceFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        OrganizationFactory,
        JwtEncrypter,
        SpaceOfServiceFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    userFactory = moduleRef.get(UserFactory);
    organizationFactory = moduleRef.get(OrganizationFactory);
    spaceofserviceFactory = moduleRef.get(SpaceOfServiceFactory);

    await app.init();
  });

  test('[GET] /spaceOfServices - should be able to list spaceOfServices from specific organization', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization1 = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organization2 = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    await spaceofserviceFactory.makePrismaSpaceOfService({
      organizationId: organization1.id,
      name: 'Hair cut',
    });
    await spaceofserviceFactory.makePrismaSpaceOfService({
      organizationId: organization1.id,
      name: 'Hair cut2',
    });

    await spaceofserviceFactory.makePrismaSpaceOfService({
      organizationId: organization2.id,
      name: 'Beard trim',
    });

    const organizationId = organization1.id.toString();

    const response = await request(app.getHttpServer())
      .get('/spaceOfServices')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.spacesOfService).toHaveLength(2);
    expect(response.body).toEqual({
      spacesOfService: expect.arrayContaining([
        expect.objectContaining({ name: 'Hair cut' }),
      ]),
    });
  });

  test('[GET] /spaceOfServices - should not be able to list spaceOfServices from non-existing organization', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const response = await request(app.getHttpServer())
      .get('/spaceOfServices')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId: 'non-existing-id',
      });

    expect(response.statusCode).toBe(400);
  });

  test('[GET] /spaceOfServices - should return a empty array if organization has no spaceOfServices', async () => {
    const user = await userFactory.makePrismaUser();
    const accessToken = await userFactory.makeToken(user.id.toString());

    const organization = await organizationFactory.makePrismaOrganization({
      ownerId: user.id,
    });

    const organizationId = organization.id.toString();

    const response = await request(app.getHttpServer())
      .get('/spaceOfServices')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organizationId,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.spacesOfService).toHaveLength(0);
  });
});
