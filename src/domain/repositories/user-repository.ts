import { User } from '../enterprise/entities/user';

export abstract class UserRepository {
  abstract create(user: User): Promise<User>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract save(id: string, data: User): Promise<User>;
  abstract delete(id: string): Promise<void>;
}
