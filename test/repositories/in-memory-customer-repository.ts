import { Customer } from '@/domain/enterprise/entities/customer';
import { CustomerRepository } from '@/domain/repositories/customer-repository';

export class InMemoryCustomerRepository implements CustomerRepository {
  public items: Customer[] = [];

  async create(customer: Customer): Promise<Customer> {
    this.items.push(customer);
    return customer;
  }

  async findByIdAndOrganization(
    id: string,
    organizationId: string,
  ): Promise<Customer | null> {
    const customer = this.items.find(
      (item) =>
        item.id.toString() === id &&
        item.organizationId.toString() === organizationId,
    );

    if (!customer) {
      return null;
    }

    return customer;
  }

  async findByPhoneAndOrganization(
    phone: string,
    organizationId: string,
  ): Promise<Customer | null> {
    const customer = this.items.find(
      (item) =>
        item.phone === phone &&
        item.organizationId.toString() === organizationId,
    );
    if (!customer) {
      return null;
    }
    return customer;
  }

  async findAllByNameAndOrganization(
    name: string,
    organizationId: string,
  ): Promise<Customer[]> {
    const customers = this.items.filter(
      (item) =>
        item.name.toLowerCase().includes(name.toLowerCase()) &&
        item.organizationId.toString() === organizationId,
    );

    return customers;
  }

  async findAllByOrganization(organizationId: string): Promise<Customer[]> {
    const customers = this.items.filter(
      (item) => item.organizationId.toString() === organizationId,
    );

    return customers;
  }

  async save(id: string, data: Customer): Promise<Customer> {
    const index = this.items.findIndex((item) => item.id.toString() === id);
    this.items[index] = data;
    return data;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id.toString() !== id);
  }
}
