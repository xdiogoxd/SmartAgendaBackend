import { AppointmentStatus } from '@/core/types/appointment-status-enum';

export function convertAppointmentStringToEnum(
  status: string,
): AppointmentStatus {
  switch (status) {
    case 'PENDING':
      return AppointmentStatus.PENDING;
    case 'CONFIRMED':
      return AppointmentStatus.CONFIRMED;
    case 'CANCELED':
      return AppointmentStatus.CANCELED;
    case 'PAID':
      return AppointmentStatus.PAID;
    case 'FINISHED':
      return AppointmentStatus.FINISHED;
    default:
      throw new Error('Invalid status');
  }
}
