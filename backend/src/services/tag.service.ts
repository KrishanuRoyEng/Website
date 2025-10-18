import prisma from '../config/database';
import { Tag } from '@prisma/client';

export class TagService {
  static async findById(id: number): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { id },
    });
  }

  static async findByName(name: string): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { name },
    });
  }

  static async getAll(skip = 0, limit = 100): Promise<Tag[]> {
    return prisma.tag.findMany({
      skip,
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });
  }

  static async create(name: string): Promise<Tag> {
    return prisma.tag.create({
      data: { name },
    });
  }

  static async update(id: number, name: string): Promise<Tag> {
    return prisma.tag.update({
      where: { id },
      data: { name },
    });
  }

  static async delete(id: number) {
    return prisma.tag.delete({
      where: { id },
    });
  }

  static async findOrCreate(name: string): Promise<Tag> {
    const existing = await this.findByName(name);
    if (existing) return existing;
    return this.create(name);
  }
}