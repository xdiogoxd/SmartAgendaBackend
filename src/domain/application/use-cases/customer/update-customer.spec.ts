import { Customer } from '@/domain/enterprise/entities/customer';

import { CustomerNotFoundError } from '../errors/customer-not-found-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { PhoneNumberAlreadyUsedError } from '../errors/phone-number-already-used-error';
import { PhoneNumberMandatoryError } from '../errors/phone-number-mandatory-error';
import { UpdateCustomerUseCase } from './update-customer';

import { makeCustomer } from 'test/factories/make-customer';
import { makeOrganization } from 'test/factories/make-organization';
import { InMemoryCustomerRepository } from 'test/repositories/in-memory-customer-repository';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';

describe('UpdateCustomerUseCase', () => {
  let organizationRepository: InMemoryOrganizationRepository;
  let customerRepository: InMemoryCustomerRepository;
  let sut: UpdateCustomerUseCase;

  beforeEach(() => {
    organizationRepository = new InMemoryOrganizationRepository();
    customerRepository = new InMemoryCustomerRepository();
    sut = new UpdateCustomerUseCase(organizationRepository, customerRepository);
  });

  it('should update a customer successfully', async () => {
    const organization = makeOrganization({ name: 'Org 1' });
    await organizationRepository.create(organization);

    const customer = makeCustomer({
      organizationId: organization.id,
      name: 'John Doe',
      phone: '1234567890',
    });
    await customerRepository.create(customer);

    const result = await sut.execute({
      customerId: customer.id.toString(),
      organizationId: organization.id.toString(),
      name: 'Jane Doe',
      phone: '0987654321',
    });

    expect(result.isRight()).toBe(true);
    expect(customerRepository.items[0]).toMatchObject({
      name: 'Jane Doe',
      phone: '0987654321',
    });
  });

  it('should not update if organization does not exist', async () => {
    const result = await sut.execute({
      customerId: 'any-customer-id',
      organizationId: 'non-existent-org',
      name: 'Name',
      phone: '123',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
  });

  it('should not update if customer does not exist', async () => {
    const organization = makeOrganization();
    await organizationRepository.create(organization);

    const result = await sut.execute({
      customerId: 'non-existent-customer',
      organizationId: organization.id.toString(),
      name: 'Name',
      phone: '123',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CustomerNotFoundError);
  });

  it('should not update if phone number is already used by another customer in the organization', async () => {
    const organization = makeOrganization();
    await organizationRepository.create(organization);

    const customer1 = makeCustomer({
      organizationId: organization.id,
      name: 'Customer 1',
      phone: '1111111111',
    });
    const customer2 = makeCustomer({
      organizationId: organization.id,
      name: 'Customer 2',
      phone: '2222222222',
    });
    await customerRepository.create(customer1);
    await customerRepository.create(customer2);

    const result = await sut.execute({
      customerId: customer2.id.toString(),
      organizationId: organization.id.toString(),
      name: 'Customer 2',
      phone: '1111111111',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(PhoneNumberAlreadyUsedError);
  });

  it('should allow updating name only, keeping phone unchanged', async () => {
    const organization = makeOrganization();
    await organizationRepository.create(organization);

    const customer = makeCustomer({
      organizationId: organization.id,
      name: 'Old Name',
      phone: '3333333333',
    });
    await customerRepository.create(customer);

    const result = await sut.execute({
      customerId: customer.id.toString(),
      organizationId: organization.id.toString(),
      name: 'New Name',
      phone: '3333333333',
    });

    expect(result.isRight()).toBe(true);
    expect(customerRepository.items[0].name).toBe('New Name');
    expect(customerRepository.items[0].phone).toBe('3333333333');
  });

  it('should allow updating phone to the same value', async () => {
    const organization = makeOrganization();
    await organizationRepository.create(organization);

    const customer = makeCustomer({
      organizationId: organization.id,
      name: 'Name',
      phone: '4444444444',
    });
    await customerRepository.create(customer);

    const result = await sut.execute({
      customerId: customer.id.toString(),
      organizationId: organization.id.toString(),
      name: 'Name',
      phone: '4444444444',
    });

    expect(result.isRight()).toBe(true);
    expect(customerRepository.items[0].phone).toBe('4444444444');
  });
});
