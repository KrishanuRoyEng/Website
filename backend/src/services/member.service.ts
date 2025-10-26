import prisma from '../config/database';
import { CreateMemberDTO, UpdateMemberDTO, MemberQuery } from '../types';
import { UserRole } from '@prisma/client';

export class MemberService {
  static async findById(id: number) {
    return prisma.member.findUnique({
      where: { id },
      include: {
        user: true,
        skills: {
          include: {
            skill: true,
          },
        },
        projects: {
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });
  }

  static async findByUserId(userId: number) {
    return prisma.member.findUnique({
      where: { userId },
      include: {
        user: true,
        skills: {
          include: {
            skill: true,
          },
        },
        projects: {
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });
  }

  static async getAll(query: MemberQuery = {}) {
    const { skip = 0, limit = 100, skillIds, approvedOnly = false } = query;

    const where: any = {};

    if (approvedOnly) {
      where.user = {
        isActive: true,
        role: {
          not: UserRole.PENDING,
        },
      };
    }

    if (skillIds && skillIds.length > 0) {
      where.skills = {
        some: {
          skillId: {
            in: skillIds,
          },
        },
      };
    }

    return prisma.member.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getLeads() {
    return prisma.member.findMany({
      where: {
        user: {
          isLead: true,
          isActive: true,
        },
      },
      include: {
        user: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  static async create(data: CreateMemberDTO) {
    return prisma.member.create({
      data,
      include: {
        user: true,
      },
    });
  }

  static async update(id: number, data: UpdateMemberDTO) {
    return prisma.member.update({
      where: { id },
      data,
      include: {
        user: true,
        skills: {
          include: {
            skill: true,
          },
        },
        projects: {
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });
  }

  static async addSkills(memberId: number, skillIds: number[]) {
    const existingSkills = await prisma.memberSkill.findMany({
      where: { memberId },
      select: { skillId: true },
    });

    const existingSkillIds = existingSkills.map((s) => s.skillId);
    const newSkillIds = skillIds.filter((id) => !existingSkillIds.includes(id));

    if (newSkillIds.length === 0) {
      return this.findById(memberId);
    }

    await prisma.memberSkill.createMany({
      data: newSkillIds.map((skillId) => ({
        memberId,
        skillId,
      })),
    });

    return this.findById(memberId);
  }

  static async removeSkill(memberId: number, skillId: number) {
    await prisma.memberSkill.delete({
      where: {
        memberId_skillId: {
          memberId,
          skillId,
        },
      },
    });

    return this.findById(memberId);
  }

  static async delete(id: number) {
    return prisma.member.delete({
      where: { id },
    });
  }
}