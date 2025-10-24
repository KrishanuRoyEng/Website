import prisma from "../config/database";
import { CreateProjectDTO, UpdateProjectDTO, ProjectQuery } from "../types";
import { Project, ProjectCategory } from "@prisma/client";
import {
  notifyNewProjectSubmission,
  notifyProjectApproved,
  notifyProjectRejected,
} from "../lib/notifications/index";

export class ProjectService {
  static async searchTags(query: string) {
    const cleanedQuery = query.startsWith("#") ? query.substring(1) : query;

    return prisma.tag.findMany({
      where: {
        name: {
          startsWith: cleanedQuery,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
      },
      take: 10,
    });
  }

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
        createdAt: "desc",
      },
    });
  }

  static async create(
    memberId: number,
    data: CreateProjectDTO
  ): Promise<Project> {
    const { tags: tagNames, ...projectData } = data;

    // Create the project first
    const project = await prisma.project.create({
      data: {
        isApproved: false,
        ...projectData,
        memberId,
      },
    });

    // Then create the tag relations
    if (tagNames && tagNames.length > 0) {
      const tagOperations = [];

      for (const tagNameWithHash of tagNames) {
        const tagName = tagNameWithHash.startsWith("#")
          ? tagNameWithHash.substring(1)
          : tagNameWithHash;

        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });

        tagOperations.push(
          prisma.projectTag.create({
            data: {
              projectId: project.id,
              tagId: tag.id,
            },
          })
        );
      }

      await Promise.all(tagOperations);
    }

    // Get the full project with member info for notification
    const projectWithMember = await prisma.project.findUnique({
      where: { id: project.id },
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

    // Notify admins about new project submission
    if (projectWithMember && projectWithMember.member) {
      await notifyNewProjectSubmission({
        id: projectWithMember.id,
        title: projectWithMember.title,
        description: projectWithMember.description || undefined,
        category: projectWithMember.category || undefined,
        member: {
          fullName: projectWithMember.member.fullName || undefined,
          user: {
            username: projectWithMember.member.user.username,
            email: projectWithMember.member.user.email || "",
          },
        },
      });
    }

    return projectWithMember!;
  }

  static async update(id: number, data: UpdateProjectDTO): Promise<Project> {
    const { tags: tagNames, ...projectData } = data;

    // Get the existing project to check if it was previously approved
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingProject) {
      throw new Error(`Project with ID ${id} not found`);
    }

    const wasApproved = existingProject.isApproved;

    // Delete all existing project tags
    await prisma.projectTag.deleteMany({
      where: { projectId: id },
    });

    // Create new project tags for each tag name
    if (tagNames && tagNames.length > 0) {
      const tagOperations = [];

      for (const tagNameWithHash of tagNames) {
        const tagName = tagNameWithHash.startsWith("#")
          ? tagNameWithHash.substring(1)
          : tagNameWithHash;

        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });

        tagOperations.push(
          prisma.projectTag.create({
            data: {
              projectId: id,
              tagId: tag.id,
            },
          })
        );
      }

      await Promise.all(tagOperations);
    }

    // Update the project itself
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        isApproved: false, // Reset approval status when project is updated
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
    });

    // Notify admins about project update for re-approval
    if (updatedProject.member) {
      await notifyNewProjectSubmission({
        id: updatedProject.id,
        title: updatedProject.title,
        description: updatedProject.description || undefined,
        category: updatedProject.category || undefined,
        member: {
          fullName: updatedProject.member.fullName || undefined,
          user: {
            username: updatedProject.member.user.username,
            email: updatedProject.member.user.email || "",
          },
        },
      });
    }

    return updatedProject;
  }

  /**
   * Update project approval status and send notifications
   */
  static async updateApprovalStatus(
    id: number,
    isApproved: boolean,
    reason?: string
  ): Promise<Project> {
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingProject) {
      throw new Error(`Project with ID ${id} not found`);
    }

    const updatedProject = await prisma.project.update({
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

    // Send appropriate notification based on approval status
    if (isApproved && updatedProject.member) {
      await notifyProjectApproved({
        id: updatedProject.id,
        title: updatedProject.title,
        member: {
          fullName: updatedProject.member.fullName || undefined,
          user: {
            username: updatedProject.member.user.username,
            email: updatedProject.member.user.email || "",
          },
        },
      });
    } else if (
      !isApproved &&
      existingProject.isApproved &&
      updatedProject.member
    ) {
      // Only notify about rejection if project was previously approved
      // (to avoid notifying about initial submission rejection)
      await notifyProjectRejected(
        {
          id: updatedProject.id,
          title: updatedProject.title,
          member: {
            fullName: updatedProject.member.fullName || undefined,
            user: {
              username: updatedProject.member.user.username,
              email: updatedProject.member.user.email || "",
            },
          },
        },
        reason
      );
    }

    return updatedProject;
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
        createdAt: "desc",
      },
    });
  }
}
