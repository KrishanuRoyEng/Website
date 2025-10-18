import prisma from '../config/database';
import { CreateEventDTO, UpdateEventDTO, EventQuery } from '../types';
import { Event } from '@prisma/client';

export class EventService {
  static async findById(id: number) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        creator: true,
      },
    });
  }

  static async getAll(query: EventQuery = {}) {
    const { skip = 0, limit = 100, upcomingOnly = false, featuredOnly = false } = query;

    const where: any = {};

    if (upcomingOnly) {
      where.isUpcoming = true;
    }

    if (featuredOnly) {
      where.isFeatured = true;
    }

    return prisma.event.findMany({
      where,
      skip,
      take: limit,
      include: {
        creator: true,
      },
      orderBy: {
        eventDate: 'desc',
      },
    });
  }

  static async getFeatured() {
    return prisma.event.findMany({
      where: {
        isFeatured: true,
        isUpcoming: true,
      },
      include: {
        creator: true,
      },
      orderBy: {
        eventDate: 'asc',
      },
      take: 5,
    });
  }

  static async getUpcoming() {
    return prisma.event.findMany({
      where: {
        isUpcoming: true,
        eventDate: {
          gte: new Date(),
        },
      },
      include: {
        creator: true,
      },
      orderBy: {
        eventDate: 'asc',
      },
    });
  }

  static async create(creatorId: number, data: CreateEventDTO): Promise<Event> {
    return prisma.event.create({
      data: {
        ...data,
        createdBy: creatorId,
      },
      include: {
        creator: true,
      },
    });
  }

  static async update(id: number, data: UpdateEventDTO): Promise<Event> {
    return prisma.event.update({
      where: { id },
      data,
      include: {
        creator: true,
      },
    });
  }

  static async setFeatured(id: number, isFeatured: boolean): Promise<Event> {
    return prisma.event.update({
      where: { id },
      data: { isFeatured },
      include: {
        creator: true,
      },
    });
  }

  static async delete(id: number) {
    return prisma.event.delete({
      where: { id },
    });
  }
}