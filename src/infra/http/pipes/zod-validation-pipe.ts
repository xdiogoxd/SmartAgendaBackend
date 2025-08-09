import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';
import { fromZodError } from 'zod-validation-error';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown) {
    try {
      this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        try {
          throw new BadRequestException({
            message: 'Validation failed',
            statusCode: 400,
            errors: fromZodError(error as any),
          });
        } catch (zodErrorParsingError) {
          throw new BadRequestException({
            message: 'Validation failed',
            statusCode: 400,
            errors: { message: 'Invalid input format' },
          });
        }
      }

      throw new BadRequestException('Validation failed');
    }
    return value;
  }
}
