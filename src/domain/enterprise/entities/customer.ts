import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface CustomerProps {
  name: string;
  phone: string;
  organizationId: UniqueEntityID;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export class Customer extends Entity<CustomerProps> {
  get name() {
    return this.props.name;
  }
  set name(name: string) {
    this.props.name = name;
    this.touch();
  }

  get phone() {
    return this.props.phone;
  }
  set phone(phone: string) {
    this.props.phone = phone;
    this.touch();
  }

  get organizationId() {
    return this.props.organizationId;
  }
  set organizationId(organizationId: UniqueEntityID) {
    this.props.organizationId = organizationId;
    this.touch();
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
  private touch() {
    this.props.updatedAt = new Date();
  }
  static create(props: CustomerProps, id?: UniqueEntityID) {
    props.createdAt = new Date();
    const customer = new Customer(props, id);

    return customer;
  }
}
