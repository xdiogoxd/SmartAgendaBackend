import { Module } from '@nestjs/common';
import { AuthenticateController } from './controllers/authenticate.controller';
import { CreateAccountController } from './controllers/create-account.controller';
import { DatabaseModule } from '../database/database.module';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { CreateAccountUseCase } from '@/domain/application/use-cases/user/create-account';
import { AuthenticateAccountUseCase } from '@/domain/application/use-cases/user/authenticate-account';
import { CreateServiceController } from './controllers/create-service.controller';
import { CreateServiceUseCase } from '@/domain/application/use-cases/service/create-service';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    CreateServiceController,
  ],
  providers: [
    CreateAccountUseCase,
    AuthenticateAccountUseCase,
    CreateServiceUseCase,
  ],
})
export class HttpModule {}
