import { AppointmentRepository } from '@/domain/repositories/appointment-repository';

export async function CheckDateAvaibility(
  organizationId: string,
  date: Date,
  spaceOfServiceId: string,
  appointmentRepository: AppointmentRepository,
): Promise<boolean> {
  const appointments = await appointmentRepository.findByDate(
    organizationId,
    date,
  );

  if (!appointments || appointments.length === 0) {
    return true;
  }

  // Filter appointments for the specific space of service
  const conflictingAppointments = appointments.filter(
    (appointment) =>
      appointment.spaceOfServiceId.toString() === spaceOfServiceId,
  );

  // If there are any appointments for this space at this time, the date is not available
  return conflictingAppointments.length === 0;
}
