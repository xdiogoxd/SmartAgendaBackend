import { UseCaseError } from '@/core/errors/use-case-error';

export class AppointmentDatesInvalidError
  extends Error
  implements UseCaseError
{
  constructor(identifier1: string, identifier2: string) {
    super(
      `Datas: ${identifier1}, ${identifier2}, estão inválidas verifique as informações enviadas`,
    );
  }
}
