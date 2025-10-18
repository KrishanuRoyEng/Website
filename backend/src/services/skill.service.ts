import prisma from '../config/database';
import { Skill } from '@prisma/client';

export class SkillService {
  static async findById(id: number): Promise<Skill | null> {
    return prisma.skill.findUnique({
      where: { id },
    });
  }

  static async findByName(name: string): Promise<Skill | null> {
    return prisma.skill.findUnique({
      where: { name },
    });
  }

  static async getAll(skip = 0, limit = 100): Promise<Skill[]> {
    return prisma.skill.findMany({
      skip,
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });
  }

  static async create(name: string, category?: string): Promise<Skill> {
    return prisma.skill.create({
      data: {
        name,
        category,
      },
    });
  }

  static async update(id: number, name?: string, category?: string): Promise<Skill> {
    return prisma.skill.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category !== undefined && { category }),
      },
    });
  }

  static async delete(id: number) {
    return prisma.skill.delete({
      where: { id },
    });
  }

  static async findOrCreate(name: string, category?: string): Promise<Skill> {
    const existing = await this.findByName(name);
    if (existing) return existing;
    return this.create(name, category);
  }
}