import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface SpaceOfServiceProps {
  organizationId: UniqueEntityID;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export class SpaceOfService extends Entity<SpaceOfServiceProps> {
  get organizationId() {
    return this.props.organizationId;
  }

  get name() {
    return this.props.name;
  }

  set name(name: string) {
    this.props.name = name;
    this.touch();
  }

  get description() {
    return this.props.description;
  }

  set description(description: string) {
    this.props.description = description;
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

  static create(
    props: Optional<SpaceOfServiceProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    props.createdAt = new Date();
    const spaceOfService = new SpaceOfService(props, id);

    return spaceOfService;
  }
}
