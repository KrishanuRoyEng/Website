import prisma from '../config/database';
import { CreateUserDTO, UpdateUserDTO } from '../types';
import { User, UserRole } from '@prisma/client';

export class UserService {
  static async findByGithubId(githubId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { githubId },
      include: {
        member: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });
  }

  static async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        member: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });
  }

  static async create(data: CreateUserDTO): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  static async update(id: number, data: UpdateUserDTO): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async updateRole(id: number, role: UserRole, isActive: boolean): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { role, isActive },
    });
  }

  static async getPendingMembers() {
    return prisma.user.findMany({
      where: {
        role: UserRole.PENDING,
      },
      include: {
        member: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getAllUsers(skip = 0, limit = 100) {
    return prisma.user.findMany({
      skip,
      take: limit,
      include: {
        member: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}