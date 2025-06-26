import { Appointment } from '@/domain/enterprise/entities/appointment';
import { AppointmentRepository } from '@/domain/repositories/appointment-repository';

export class InMemoryAppointmentRepository implements AppointmentRepository {
  public items: Appointment[] = [];
  async create(appointment: Appointment) {
    this.items.push(appointment);
    return appointment;
  }

  async findById(id: string): Promise<Appointment | null> {
    const appointment = this.items.find((item) => item.id.toString() === id);

    if (!appointment) {
      return null;
    }

    return appointment;
  }
  async findByDate(organizationId: string, date: Date): Promise<Appointment[]> {
    const appointments = this.items.filter(
      (item) =>
        item.organizationId.toString() === organizationId &&
        item.date.toDateString() === date.toDateString(),
    );
    return appointments;
  }
  async findByDateRange(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    const appointments = this.items.filter(
      (item) =>
        item.organizationId.toString() === organizationId &&
        item.date >= startDate &&
        item.date <= endDate,
    );

    return appointments;
  }

  async findAll(): Promise<Appointment[]> {
    return this.items;
  }

  async save(id: string, data: Appointment): Promise<Appointment> {
    const index = this.items.findIndex((item) => item.id.toString() === id);
    this.items[index] = data;
    return data;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id.toString() !== id);
  }
}
