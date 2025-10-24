import prisma from "../config/database";
import { CreateProjectDTO, UpdateProjectDTO, ProjectQuery } from "../types";
import { Project, ProjectCategory } from "@prisma/client";

// Helper function to clean tag names (remove '#') and prepare the connectOrCreate structure
const mapTagNamesToNestedWrites = (tagNames: string[]) => {
  return tagNames.map((tagNameWithHash: string) => {
    const tagName = tagNameWithHash.startsWith('#')
      ? tagNameWithHash.substring(1)
      : tagNameWithHash;
    
    return {
      tag: {
        connectOrCreate: {
          where: { name: tagName }, 
          create: { name: tagName }  
        }
      }
    };
  });
};

export class ProjectService {
  
  static async searchTags(query: string) {
    const cleanedQuery = query.startsWith('#')
      ? query.substring(1)
      : query;

    return prisma.tag.findMany({
      where: {
        name: {
          startsWith: cleanedQuery,
          mode: 'insensitive',
        }
      },
      select: { 
        id: true,
        name: true
      },
      take: 10, // Limit the results for a clean dropdown
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

    const tagOperations = tagNames ? mapTagNamesToNestedWrites(tagNames) : [];

    return prisma.project.create({
      data: {
        isApproved: false,
        ...projectData,
        memberId,
        tags: tagNames
          ? {
              create: tagOperations,
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
  const { tags: tagNames, ...projectData } = data;
  
  // First, get the current project to handle tag updates properly
  const currentProject = await prisma.project.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } }
  });

  let tagsUpdate: any = {};

  if (tagNames !== undefined) {
    // Delete all existing project tags
    await prisma.projectTag.deleteMany({
      where: { projectId: id }
    });

    // Create new project tags for each tag name
    if (tagNames.length > 0) {
      const tagOperations = [];
      
      for (const tagNameWithHash of tagNames) {
        const tagName = tagNameWithHash.startsWith('#')
          ? tagNameWithHash.substring(1)
          : tagNameWithHash;
        
        // Find or create the tag
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName }
        });
        
        // Create the project tag relation
        tagOperations.push(
          prisma.projectTag.create({
            data: {
              projectId: id,
              tagId: tag.id
            }
          })
        );
      }
      
      await Promise.all(tagOperations);
    }
  }

  // Update the project itself
  return prisma.project.update({
    where: { id },
    data: {
      ...projectData,
      isApproved: false,
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
  /**
   * Updates the approval status of a project.
   * To set a project back to "not approved" (pending), call this with isApproved: false.
   * To approve a project, call this with isApproved: true.
   */

  static async updateApprovalStatus(
    id: number,
    isApproved: boolean
  ): Promise<Project> {
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
        createdAt: "desc",
      },
    });
  }
}
