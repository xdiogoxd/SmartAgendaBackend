import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';

import { InvalidCredentialsError } from '@/domain/application/use-cases/errors/invalid-credentials-error';
import { AuthenticateAccountUseCase } from '@/domain/application/use-cases/user/authenticate-account';
import { Public } from '@/infra/auth/public';

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';

import { z } from 'zod';

const authenticateAccountBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type AuthenticateAccountBodySchema = z.infer<
  typeof authenticateAccountBodySchema
>;

@Controller('/sessions')
@Public()
export class AuthenticateController {
  constructor(private authenticateUser: AuthenticateAccountUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(authenticateAccountBodySchema))
  async handle(@Body() body: AuthenticateAccountBodySchema) {
    const { email, password } = body;

    const result = await this.authenticateUser.execute({
      email,
      password,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case InvalidCredentialsError:
          throw new UnauthorizedException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { accessToken } = result.value;

    return { access_token: accessToken };
  }
}
