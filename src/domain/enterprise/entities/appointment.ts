import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { AppointmentStatus } from '@/core/types/appointment-status-enum';
import { Optional } from '@/core/types/optional';
export interface AppointmentProps {
  date: Date;
  description: string;
  observations: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt?: Date | null;
  canceledAt?: Date | null;
  finishedAt?: Date | null;
  organizationId: UniqueEntityID;
  serviceId: UniqueEntityID;
  spaceOfServiceId: UniqueEntityID;
  clientId: UniqueEntityID;
}

export class Appointment extends Entity<AppointmentProps> {
  get date() {
    return this.props.date;
  }

  set date(date: Date) {
    this.props.date = date;
    this.touch();
  }

  get description() {
    return this.props.description;
  }

  set description(description: string) {
    this.props.description = description;
    this.touch();
  }

  get observations() {
    return this.props.observations;
  }

  set observations(observations: string) {
    this.props.observations = observations;
    this.touch();
  }

  get status() {
    return this.props.status;
  }

  set status(status: AppointmentStatus) {
    this.props.status = status;
    this.touch();
  }

  get organizationId() {
    return this.props.organizationId;
  }

  set organizationId(organizationId: UniqueEntityID) {
    this.props.organizationId = organizationId;
    this.touch();
  }

  get serviceId() {
    return this.props.serviceId;
  }

  set serviceId(serviceId: UniqueEntityID) {
    this.props.serviceId = serviceId;
    this.touch();
  }

  get spaceOfServiceId() {
    return this.props.spaceOfServiceId;
  }

  set spaceOfServiceId(spaceOfServiceId: UniqueEntityID) {
    this.props.spaceOfServiceId = spaceOfServiceId;
    this.touch();
  }

  get clientId() {
    return this.props.clientId;
  }

  set clientId(clientId: UniqueEntityID) {
    this.props.clientId = clientId;
    this.touch();
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get canceledAt() {
    return this.props.canceledAt;
  }

  set canceledAt(canceledAt: Date | null) {
    this.props.canceledAt = canceledAt;
    this.touch();
  }

  get finishedAt() {
    return this.props.finishedAt;
  }

  set finishedAt(finishedAt: Date | null) {
    this.props.finishedAt = finishedAt;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      AppointmentProps,
      'createdAt' | 'canceledAt' | 'finishedAt' | 'updatedAt'
    >,
    id?: UniqueEntityID,
  ) {
    const appointment = new Appointment(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        canceledAt: props.canceledAt ?? null,
        finishedAt: props.finishedAt ?? null,
      },
      id,
    );

    return appointment;
  }
}
