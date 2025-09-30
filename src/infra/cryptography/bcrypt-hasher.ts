import { HashComparer } from '@/domain/application/cryptography/hash-comparer';
import { HashGenerator } from '@/domain/application/cryptography/hash-generator';

import { compare, hash } from 'bcryptjs';

export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGHT = 8;

  async hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGHT);
  }
  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash);
  }
}
