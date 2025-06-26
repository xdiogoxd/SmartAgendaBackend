import { UseCaseError } from '@/core/errors/use-case-error';

export class AppointmentStatusInvalidError
  extends Error
  implements UseCaseError
{
  constructor(identifier: string, status: string) {
    super(
      `Atendimento: ${identifier}, não pode ser movido para o status ${status}`,
    );
  }
}
