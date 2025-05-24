import { User } from '../enterprise/entities/users';

export abstract class UsersRepository {
  abstract create(user: User): Promise<User>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract save(id: string, data: Partial<User>): Promise<User>;
  abstract delete(id: string): Promise<void>;
}
