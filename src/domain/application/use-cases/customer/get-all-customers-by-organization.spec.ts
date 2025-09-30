import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { GetAllCustomersByOrganizationUseCase } from './get-all-customers-by-organization';

import { makeCustomer } from 'test/factories/make-customer';
import { makeOrganization } from 'test/factories/make-organization';
import { InMemoryCustomerRepository } from 'test/repositories/in-memory-customer-repository';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';

describe('GetAllCustomersByOrganizationUseCase', () => {
  let organizationRepository: InMemoryOrganizationRepository;
  let customerRepository: InMemoryCustomerRepository;
  let sut: GetAllCustomersByOrganizationUseCase;

  beforeEach(() => {
    organizationRepository = new InMemoryOrganizationRepository();
    customerRepository = new InMemoryCustomerRepository();
    sut = new GetAllCustomersByOrganizationUseCase(
      organizationRepository as any,
      customerRepository as any,
    );
  });

  it('should return all customers for a valid organization', async () => {
    const organization = makeOrganization({ name: 'Org 1' });
    await organizationRepository.create(organization);

    const customer1 = makeCustomer({
      organizationId: organization.id,
    });
    const customer2 = makeCustomer({
      organizationId: organization.id,
    });

    await customerRepository.create(customer1);
    await customerRepository.create(customer2);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(result.value.customers).toHaveLength(2);
      expect(result.value.customers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: customer1.name,
            phone: customer1.phone,
          }),
          expect.objectContaining({
            name: customer2.name,
            phone: customer2.phone,
          }),
        ]),
      );
    }
  });

  it('should return an empty array if organization has no customers', async () => {
    const organization = makeOrganization({ name: 'Org 2' });
    await organizationRepository.create(organization);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value?.customers).toHaveLength(0);
    }
  });

  it('should return OrganizationNotFoundError if organization does not exist', async () => {
    const result = await sut.execute({ organizationId: 'non-existent-org' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
  });

  it('should only return customers belonging to the specified organization', async () => {
    const org1 = makeOrganization({ name: 'Org 1' });
    const org2 = makeOrganization({ name: 'Org 2' });
    await organizationRepository.create(org1);
    await organizationRepository.create(org2);

    const customer1 = makeCustomer({
      organizationId: org1.id,
    });
    const customer2 = makeCustomer({
      organizationId: org2.id,
    });

    await customerRepository.create(customer1);
    await customerRepository.create(customer2);

    const result = await sut.execute({ organizationId: org1.id.toString() });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.customers).toHaveLength(1);
      expect(result.value.customers[0]).toMatchObject({
        name: customer1.name,
        phone: customer1.phone,
        organizationId: customer1.organizationId,
      });
    }
  });

  it('should not return any customers if organization doesnt exist', async () => {
    const result = await sut.execute({ organizationId: 'non-existent-org' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
  });
});
