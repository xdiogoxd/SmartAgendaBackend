import { User } from '@/domain/enterprise/entities/users';
import { UsersRepository } from '@/domain/repositories/users-repository';
import { Injectable } from '@nestjs/common';
import { Encrypter } from '../cryptography/encrypter';
import { HashComparer } from '../cryptography/hash-comparer';
import { HashGenerator } from '../cryptography/hash-generator';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UsersRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async create(user: User): Promise<User> {
    const emailInUse = await this.userRepository.findByEmail(user.email);
    if (emailInUse) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await this.hashGenerator.hash(user.password);
    user.password = hashedPassword;

    return await this.userRepository.create(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async findBydId(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async save(id: string, data: Partial<User>): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    await this.userRepository.save(id, data);
    return await this.findBydId(id);
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    await this.userRepository.delete(id);
  }
}
