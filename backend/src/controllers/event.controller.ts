import { Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler'; // Adjust import path as needed

export class EventController {
  /**
   * Get all events with optional filters
   * GET /api/events
   * Query params: skip, limit, upcomingOnly, featuredOnly
   */
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 100;
    const upcomingOnly = req.query.upcomingOnly === 'true';
    const featuredOnly = req.query.featuredOnly === 'true';

    const events = await EventService.getAll({
      skip,
      limit,
      upcomingOnly,
      featuredOnly,
    });

    return res.json(events);
  });

  /**
   * Get a single event by ID
   * GET /api/events/:id
   */
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await EventService.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json(event);
  });

  /**
   * Get featured events (for homepage)
   * GET /api/events/featured
   */
  static getFeatured = asyncHandler(async (req: Request, res: Response) => {
    const events = await EventService.getFeatured();
    return res.json(events);
  });

  /**
   * Get upcoming events
   * GET /api/events/upcoming
   */
  static getUpcoming = asyncHandler(async (req: Request, res: Response) => {
    const events = await EventService.getUpcoming();
    return res.json(events);
  });

  /**
   * Create a new event
   * POST /api/events
   * Requires: Authentication and Active status
   */
  static create = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { title, description, eventDate, location, imageUrl, registrationUrl } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({ error: 'Event title is required' });
    }

    if (!eventDate) {
      return res.status(400).json({ error: 'Event date is required' });
    }

    // Validate date format
    const parsedDate = new Date(eventDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid event date format' });
    }

    const eventData = {
      title,
      description,
      eventDate: parsedDate,
      location,
      imageUrl,
      registrationUrl,
    };

    const event = await EventService.create(req.user.id, eventData);

    return res.status(201).json(event);
  });

  /**
   * Update an event
   * PUT /api/events/:id
   * Requires: Admin role
   */
  static update = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await EventService.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const updateData: any = {};

    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.eventDate !== undefined) {
      const parsedDate = new Date(req.body.eventDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid event date format' });
      }
      updateData.eventDate = parsedDate;
    }
    if (req.body.location !== undefined) updateData.location = req.body.location;
    if (req.body.imageUrl !== undefined) updateData.imageUrl = req.body.imageUrl;
    if (req.body.registrationUrl !== undefined) updateData.registrationUrl = req.body.registrationUrl;
    if (req.body.isFeatured !== undefined) updateData.isFeatured = req.body.isFeatured;
    if (req.body.isUpcoming !== undefined) updateData.isUpcoming = req.body.isUpcoming;

    const updated = await EventService.update(id, updateData);

    return res.json(updated);
  });

  /**
   * Delete an event
   * DELETE /api/events/:id
   * Requires: Admin role
   */
  static delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await EventService.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await EventService.delete(id);

    return res.json({ 
      message: 'Event deleted successfully',
      deletedEventId: id 
    });
  });
}