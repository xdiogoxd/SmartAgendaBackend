import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface ServiceProps {
  organizationId: UniqueEntityID;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date | null;
  observations?: string | null;
}

export class Service extends Entity<ServiceProps> {
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

  get observations() {
    return this.props.observations;
  }

  set observations(observations: string) {
    this.props.observations = observations;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<ServiceProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    props.createdAt = new Date();
    const service = new Service(props, id);

    return service;
  }
}
