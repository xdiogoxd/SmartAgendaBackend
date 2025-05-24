import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Env } from '@/infra/env/env';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: (config: ConfigService<Env, true>) => {
        const privateKey = config.get('JWT_PRIVATE_KEY', { infer: true });
        const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true });
        if (!privateKey || !publicKey) {
          throw new Error('Private or public key not found');
        }
        return {
          signOptions: { algorithm: 'RS256', expiresIn: '1d' },
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
        };
      },
    }),
  ],
})
export class AuthModule {}
