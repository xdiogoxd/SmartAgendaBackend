import { Customer } from '@/domain/enterprise/entities/customer';

import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { PhoneNumberAlreadyUsedError } from '../errors/phone-number-already-used-error';
import { PhoneNumberMandatoryError } from '../errors/phone-number-mandatory-error';
import { CreateCustomerUseCase } from './create-customer';

import { makeOrganization } from 'test/factories/make-organization';
import { InMemoryCustomerRepository } from 'test/repositories/in-memory-customer-repository';
import { InMemoryOrganizationRepository } from 'test/repositories/in-memory-organization-repository';

describe('CreateCustomerUseCase', () => {
  let organizationRepository: InMemoryOrganizationRepository;
  let customerRepository: InMemoryCustomerRepository;
  let sut: CreateCustomerUseCase;

  beforeEach(() => {
    organizationRepository = new InMemoryOrganizationRepository();
    customerRepository = new InMemoryCustomerRepository();
    sut = new CreateCustomerUseCase(organizationRepository, customerRepository);
  });

  it('should create a customer successfully', async () => {
    const organization = makeOrganization({ name: 'Organization 1' });
    await organizationRepository.create(organization);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      name: 'John Doe',
      phone: '1234567890',
    });

    expect(result.isRight()).toBe(true);
    expect(customerRepository.items).toHaveLength(1);
    expect(customerRepository.items[0]).toMatchObject({
      name: 'John Doe',
      phone: '1234567890',
      organizationId: organization.id,
    });
  });

  it('should not create a customer if organization does not exist', async () => {
    const result = await sut.execute({
      organizationId: 'non-existent-organization',
      name: 'Jane Doe',
      phone: '1234567890',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
  });

  it('should not create a customer if phone number already used in organization', async () => {
    const organization = makeOrganization({ name: 'Organization 2' });
    await organizationRepository.create(organization);

    const existingCustomer = Customer.create({
      organizationId: organization.id,
      name: 'Existing',
      phone: '9999999999',
    });
    await customerRepository.create(existingCustomer);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      name: 'New Customer',
      phone: '9999999999',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(PhoneNumberAlreadyUsedError);
  });

  it('should not allow creating customer without phone', async () => {
    const organization = makeOrganization({ name: 'Organization 3' });
    await organizationRepository.create(organization);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      name: 'No Phone Customer',
      phone: null,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(PhoneNumberMandatoryError);
  });

  it('should not create customer if phone exists among all organization customers', async () => {
    const organization = makeOrganization();
    await organizationRepository.create(organization);

    const customer = Customer.create({
      organizationId: organization.id,
      name: 'Customer1',
      phone: '5555555555',
    });
    await customerRepository.create(customer);

    const result = await sut.execute({
      organizationId: organization.id.toString(),
      name: 'Customer2',
      phone: '5555555555',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(PhoneNumberAlreadyUsedError);
  });
});
