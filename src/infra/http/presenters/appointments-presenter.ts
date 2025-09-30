import { Appointment } from '@/domain/enterprise/entities/appointment';

export class AppointmentPresenter {
  static toHTTP(appointment: Appointment) {
    return {
      id: appointment.id.toString(),
      description: appointment.description,
      observations: appointment.observations,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      canceledAt: appointment.canceledAt,
      finishedAt: appointment.finishedAt,
      organizationId: appointment.organizationId,
      serviceId: appointment.serviceId.toString(),
      spaceOfServiceId: appointment.spaceOfServiceId.toString(),
      customerId: appointment.customerId.toString(),
    };
  }
}
