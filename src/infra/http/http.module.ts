import { Module } from '@nestjs/common';
import { AuthenticateController } from './controllers/sessions/authenticate.controller';
import { CreateAccountController } from './controllers/accounts/create-account.controller';
import { DatabaseModule } from '../database/database.module';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { CreateAccountUseCase } from '@/domain/application/use-cases/user/create-account';
import { AuthenticateAccountUseCase } from '@/domain/application/use-cases/user/authenticate-account';
import { CreateServiceController } from './controllers/services/create-service.controller';
import { CreateServiceUseCase } from '@/domain/application/use-cases/service/create-service';
import { UpdateServiceController } from './controllers/services/update-service.controller';
import { UpdateServiceUseCase } from '@/domain/application/use-cases/service/update-service';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    CreateServiceController,
    UpdateServiceController,
  ],
  providers: [
    CreateAccountUseCase,
    AuthenticateAccountUseCase,
    CreateServiceUseCase,
    UpdateServiceUseCase,
  ],
})
export class HttpModule {}
