import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface ServiceProps {
  name: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Service extends Entity<ServiceProps> {
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

  get price() {
    return this.props.price;
  }

  set price(price: number) {
    this.props.price = price;
    this.touch();
  }

  get duration() {
    return this.props.duration;
  }

  set duration(duration: number) {
    this.props.duration = duration;
    this.touch();
  }

  get image() {
    return this.props.image;
  }

  set image(image: string) {
    this.props.image = image;
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
    props: Optional<ServiceProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    const service = new Service(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );

    return service;
  }
}
