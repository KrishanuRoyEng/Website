import prisma from '../config/database';
import { CreateProjectDTO, UpdateProjectDTO, ProjectQuery } from '../types';
import { Project, ProjectCategory } from '@prisma/client';

export class ProjectService {
  static async findById(id: number) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        member: {
          include: {
            user: true,
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  static async getAll(query: ProjectQuery = {}) {
    const {
      skip = 0,
      limit = 100,
      category,
      tagIds,
      memberId,
      approvedOnly = false,
    } = query;

    const where: any = {};

    if (approvedOnly) {
      where.isApproved = true;
    }

    if (category) {
      where.category = category;
    }

    if (memberId) {
      where.memberId = memberId;
    }

    if (tagIds && tagIds.length > 0) {
      where.tags = {
        some: {
          tagId: {
            in: tagIds,
          },
        },
      };
    }

    return prisma.project.findMany({
      where,
      skip,
      take: limit,
      include: {
        member: {
          include: {
            user: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async create(memberId: number, data: CreateProjectDTO): Promise<Project> {
    const { tagIds, ...projectData } = data;

    return prisma.project.create({
      data: {
        ...projectData,
        memberId,
        tags: tagIds
          ? {
              create: tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  static async update(id: number, data: UpdateProjectDTO): Promise<Project> {
    const { tagIds, ...projectData } = data;

    // If tagIds provided, update tag associations
    if (tagIds !== undefined) {
      // Remove existing tags
      await prisma.projectTag.deleteMany({
        where: { projectId: id },
      });

      // Add new tags
      if (tagIds.length > 0) {
        await prisma.projectTag.createMany({
          data: tagIds.map((tagId) => ({
            projectId: id,
            tagId,
          })),
        });
      }
    }

    return prisma.project.update({
      where: { id },
      data: projectData,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  static async approve(id: number, isApproved: boolean): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data: { isApproved },
      include: {
        member: {
          include: {
            user: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  static async delete(id: number) {
    return prisma.project.delete({
      where: { id },
    });
  }

  static async getPendingProjects() {
    return prisma.project.findMany({
      where: {
        isApproved: false,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}