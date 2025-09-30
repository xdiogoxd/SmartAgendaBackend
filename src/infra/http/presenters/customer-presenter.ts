import { Customer } from '@/domain/enterprise/entities/customer';

export class CustomerPresenter {
  static toHTTP(customer: Customer) {
    return {
      id: customer.id.toString(),
      name: customer.name,
      phone: customer.phone,
      organizationId: customer.organizationId.toString(),
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
