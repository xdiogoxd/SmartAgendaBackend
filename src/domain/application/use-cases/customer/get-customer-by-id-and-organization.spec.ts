import { Customer } from '@/domain/enterprise/entities/customer';

import { CustomerNotFoundError } from '../errors/customer-not-found-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { GetCustomerByIdAndOrganizationUseCase } from './get-customer-by-id-and-organization';

import { makeCustomer } from 'test/factories/make-customer';
import { makeOrganization } from 'test/factories/make-organization';
import { InMemoryCustomerRepository } from 'test/repositories/in-memory-customer-repository';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';

describe('GetCustomerByIdAndOrganizationUseCase', () => {
  let organizationRepository: InMemoryOrganizationRepository;
  let customerRepository: InMemoryCustomerRepository;
  let sut: GetCustomerByIdAndOrganizationUseCase;

  beforeEach(() => {
    organizationRepository = new InMemoryOrganizationRepository();
    customerRepository = new InMemoryCustomerRepository();
    sut = new GetCustomerByIdAndOrganizationUseCase(
      organizationRepository,
      customerRepository,
    );
  });

  it('should return the customer for a valid id and organization', async () => {
    const organization = makeOrganization({ name: 'Org 1' });
    await organizationRepository.create(organization);

    const customer = makeCustomer({
      organizationId: organization.id,
    });

    await customerRepository.create(customer);

    const result = await sut.execute({
      id: customer.id.toString(),
      organizationId: organization.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.customer).toMatchObject({
        name: customer.name,
        id: customer.id,
        organizationId: organization.id,
      });
    }
  });

  it('should return CustomerNotFoundError if customer does not exist for the given id and organization', async () => {
    const organization = makeOrganization({ name: 'Org 2' });
    await organizationRepository.create(organization);

    const result = await sut.execute({
      id: '9999999999',
      organizationId: organization.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CustomerNotFoundError);
  });

  it('should return OrganizationNotFoundError if organization does not exist', async () => {
    const result = await sut.execute({
      id: '1111111111',
      organizationId: 'non-existent-org',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
  });

  it('should not return a customer if id exists in another organization', async () => {
    const org1 = makeOrganization({ name: 'Org 1' });
    const org2 = makeOrganization({ name: 'Org 2' });
    await organizationRepository.create(org1);
    await organizationRepository.create(org2);

    const customer = makeCustomer({
      organizationId: org1.id,
    });
    await customerRepository.create(customer);

    const result = await sut.execute({
      id: customer.id.toString(),
      organizationId: org2.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CustomerNotFoundError);
  });

  it('should return the correct customer if multiple customers exist with different ids', async () => {
    const organization = makeOrganization({ name: 'Org 3' });
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
      id: customer2.id.toString(),
      organizationId: organization.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.customer).toMatchObject({
        name: customer2.name,
        id: customer2.id,
        organizationId: organization.id,
      });
    }
  });

  it('should return CustomerNotFoundError if no customers exist at all', async () => {
    const organization = makeOrganization({ name: 'Org 4' });
    await organizationRepository.create(organization);

    const result = await sut.execute({
      id: '5555555555',
      organizationId: organization.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CustomerNotFoundError);
  });

  it('should return CustomerNotFoundError if there is no customer with the given id', async () => {
    const organization = makeOrganization({ name: 'Org 5' });
    await organizationRepository.create(organization);

    const customer = makeCustomer({
      organizationId: organization.id,
      name: 'Eve',
    });
    await customerRepository.create(customer);

    const result = await sut.execute({
      id: '7777777777',
      organizationId: organization.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CustomerNotFoundError);
  });
});
