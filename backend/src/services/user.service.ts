import prisma from "../config/database";
import { CreateUserDTO, UpdateUserDTO } from "../types";
import { User, UserRole } from "@prisma/client";
import logger from "../utils/logger";
import {
  notifyNewUserSignup,
  notifyUserApproved,
} from "../lib/notifications/index";

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
    const user = await prisma.user.create({
      data,
    });

    // Notify admins about new user signup
    await notifyNewUserSignup({
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    });

    return user;
  }

  static async update(id: number, data: UpdateUserDTO): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Update user role and status, triggering approval notifications if relevant
   */
  static async updateRole(
    id: number,
    role: UserRole,
    isActive: boolean,
    reason?: string
  ): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error(`User with ID ${id} not found.`);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role, isActive },
    });

    // Notification Logic
    const wasPending = existingUser.role === UserRole.PENDING;
    const isApproved =
      (updatedUser.role === UserRole.MEMBER || updatedUser.role === UserRole.ADMIN) &&
      updatedUser.isActive === true;

    if (wasPending && isApproved) {
      await notifyUserApproved(updatedUser);
    }

    return updatedUser;
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
        createdAt: "desc",
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
        createdAt: "desc",
      },
    });
  }
}