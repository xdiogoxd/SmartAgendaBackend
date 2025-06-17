import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

//Start and end hour set in minutes
//Weekdays set in number format, monday = 0, tuesday = 1, etc.
export interface ScheduleProps {
  organizationId: UniqueEntityID;
  weekDay: number;
  startHour: number;
  endHour: number;
  createdAt?: Date;
  updatedAt?: Date | null;
}
export class Schedule extends Entity<ScheduleProps> {
  get organizationId() {
    return this.props.organizationId;
  }
  set organizationId(organizationId: UniqueEntityID) {
    this.props.organizationId = organizationId;
    this.touch();
  }

  get weekDay() {
    return this.props.weekDay;
  }

  set weekDay(weekDay: ScheduleProps['weekDay']) {
    this.props.weekDay = weekDay;
    this.touch();
  }

  get startHour() {
    return this.props.startHour;
  }

  set startHour(startHour: number) {
    this.props.startHour = startHour;
    this.touch();
  }

  get endHour() {
    return this.props.endHour;
  }

  set endHour(endHour: number) {
    this.props.endHour = endHour;
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

  static create(props: ScheduleProps, id?: UniqueEntityID) {
    props.createdAt = new Date();
    const schedule = new Schedule(props, id);

    return schedule;
  }
}
