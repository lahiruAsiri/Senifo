import bcrypt from 'bcrypt';
import { prisma } from '../../config/database';
import type { CreateUserInput, UpdateUserInput } from '../../schemas/user.schema';
import { Role } from '@prisma/client';

const USER_SELECT = {
  id: true, email: true, name: true, phone: true, role: true,
  isActive: true, avatar: true, createdAt: true, updatedAt: true, lastLoginAt: true,
};

export class UsersService {
  async findAll(cursor?: string, take = 20) {
    const users = await prisma.user.findMany({
      select: USER_SELECT,
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
    return { users, hasMore: users.length === take };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: USER_SELECT });
    if (!user) throw new Error('User not found');
    return user;
  }

  async create(input: CreateUserInput) {
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw new Error('Email already in use');
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: { email: input.email, name: input.name, phone: input.phone, role: input.role, passwordHash },
      select: USER_SELECT,
    });
    return user;
  }

  async update(id: string, input: UpdateUserInput) {
    const user = await prisma.user.update({ where: { id }, data: input, select: USER_SELECT });
    return user;
  }

  async changeRole(id: string, role: Role) {
    return prisma.user.update({ where: { id }, data: { role }, select: USER_SELECT });
  }

  async setActive(id: string, isActive: boolean) {
    return prisma.user.update({ where: { id }, data: { isActive }, select: USER_SELECT });
  }

  async delete(id: string) {
    await prisma.user.delete({ where: { id } });
  }
}

export const usersService = new UsersService();
