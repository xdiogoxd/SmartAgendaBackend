import { Customer } from '../enterprise/entities/customer';

export abstract class CustomerRepository {
  abstract create(customer: Customer): Promise<Customer>;
  abstract findByIdAndOrganization(
    id: string,
    organizationId: string,
  ): Promise<Customer | null>;
  abstract findByPhoneAndOrganization(
    phone: string,
    organizationId: string,
  ): Promise<Customer | null>;
  abstract findAllByNameAndOrganization(
    name: string,
    organizationId: string,
  ): Promise<Customer[]>;
  abstract findAllByOrganization(organizationId: string): Promise<Customer[]>;
  abstract save(id: string, data: Customer): Promise<Customer>;
  abstract delete(id: string): Promise<void>;
}
