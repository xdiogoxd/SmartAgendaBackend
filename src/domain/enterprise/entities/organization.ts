import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';
import { User } from './user';

export interface OrganizationProps {
  name: string;
  ownerId: string;
  members?: User[];
  createdAt: Date;
  updatedAt?: Date | null;
}
export class Organization extends Entity<OrganizationProps> {
  get name() {
    return this.props.name;
  }

  set name(name: string) {
    this.props.name = name;
    this.touch();
  }

  get ownerId() {
    return this.props.ownerId;
  }

  set ownerId(ownerId: string) {
    this.props.ownerId = ownerId;
    this.touch();
  }
  get members() {
    return this.props.members;
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

  static create(
    props: Optional<OrganizationProps, 'createdAt' | 'members'>,
    id?: UniqueEntityID,
  ) {
    const organization = new Organization(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        members: props.members ?? [],
      },
      id,
    );

    return organization;
  }
}
