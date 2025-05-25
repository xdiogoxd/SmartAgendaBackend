import { User } from '@/domain/enterprise/entities/user';
import { UserRepository } from '@/domain/repositories/user-repository';

export class InMemoryUserRepository implements UserRepository {
  public items: User[] = [];

  async create(User: User) {
    this.items.push(User);
    return User;
  }

  async findById(id: string): Promise<User | null> {
    const User = this.items.find((item) => item.id.toString() === id);

    if (!User) {
      return null;
    }

    return User;
  }

  async findByEmail(email: string) {
    const User = this.items.find((item) => item.email === email);

    if (!User) {
      return null;
    }

    return User;
  }

  async findAll(): Promise<User[]> {
    return this.items;
  }
  async save(id: string, data: User): Promise<User> {
    const index = this.items.findIndex((item) => item.id.toString() === id);
    this.items[index] = data;
    return data;
  }
  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id.toString() !== id);
  }
}
