import { Encrypter } from '@/domain/application/cryptography/encrypter';
import { Module } from '@nestjs/common';
import { JwtEncrypter } from './jwt-encryptor';
import { HashComparer } from '@/domain/application/cryptography/hash-comparer';
import { HashGenerator } from '@/domain/application/cryptography/hash-generator';
import { BcryptHasher } from './bcrypt-hasher';

@Module({
  providers: [
    {
      provide: Encrypter,
      useClass: JwtEncrypter,
    },
    {
      provide: HashComparer,
      useClass: BcryptHasher,
    },
    {
      provide: HashGenerator,
      useClass: BcryptHasher,
    },
  ],
  exports: [Encrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}
