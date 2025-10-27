import prisma from "../config/database";
import { CreateCustomRoleDTO, UpdateCustomRoleDTO } from "../types";
import { Permission } from "@prisma/client";

export class CustomRoleService {
  static async findAll() {
    return prisma.customRole.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  static async findById(id: number) {
    return prisma.customRole.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        users: {
          include: {
            member: true,
          },
        },
      },
    });
  }

  static async create(data: CreateCustomRoleDTO, createdBy?: number) {
    return prisma.customRole.create({
      data: {
        ...data,
        createdBy,
      },
    });
  }

  static async update(id: number, data: UpdateCustomRoleDTO) {
    return prisma.customRole.update({
      where: { id },
      data,
    });
  }

  static async delete(id: number) {
    // Check if role is assigned to any users
    const usersWithRole = await prisma.user.count({
      where: { customRoleId: id },
    });

    if (usersWithRole > 0) {
      throw new Error('Cannot delete role that is assigned to users');
    }

    return prisma.customRole.delete({
      where: { id },
    });
  }

  static async getUsersWithRole(roleId: number) {
    return prisma.user.findMany({
      where: { customRoleId: roleId },
      include: {
        member: true,
      },
    });
  }
}