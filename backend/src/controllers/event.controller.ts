import { Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { AuthRequest } from '../types';

export class EventController {
  /**
   * Get all events with optional filters
   * GET /api/events
   * Query params: skip, limit, upcomingOnly, featuredOnly
   */
  static async getAll(req: Request, res: Response) {
    try {
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
    } catch (error) {
      console.error('Get all events error:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }
  }

  /**
   * Get a single event by ID
   * GET /api/events/:id
   */
  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid event ID' });
      }

      const event = await EventService.findById(id);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      return res.json(event);
    } catch (error) {
      console.error('Get event by ID error:', error);
      return res.status(500).json({ error: 'Failed to fetch event' });
    }
  }

  /**
   * Get featured events (for homepage)
   * GET /api/events/featured
   */
  static async getFeatured(req: Request, res: Response) {
    try {
      const events = await EventService.getFeatured();
      return res.json(events);
    } catch (error) {
      console.error('Get featured events error:', error);
      return res.status(500).json({ error: 'Failed to fetch featured events' });
    }
  }

  /**
   * Get upcoming events
   * GET /api/events/upcoming
   */
  static async getUpcoming(req: Request, res: Response) {
    try {
      const events = await EventService.getUpcoming();
      return res.json(events);
    } catch (error) {
      console.error('Get upcoming events error:', error);
      return res.status(500).json({ error: 'Failed to fetch upcoming events' });
    }
  }

  /**
   * Create a new event
   * POST /api/events
   * Requires: Authentication and Active status
   */
  static async create(req: AuthRequest, res: Response) {
    try {
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
    } catch (error) {
      console.error('Create event error:', error);
      return res.status(500).json({ error: 'Failed to create event' });
    }
  }

  /**
   * Update an event
   * PUT /api/events/:id
   * Requires: Admin role
   */
  static async update(req: AuthRequest, res: Response) {
    try {
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
    } catch (error) {
      console.error('Update event error:', error);
      return res.status(500).json({ error: 'Failed to update event' });
    }
  }

  /**
   * Delete an event
   * DELETE /api/events/:id
   * Requires: Admin role
   */
  static async delete(req: AuthRequest, res: Response) {
    try {
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
    } catch (error) {
      console.error('Delete event error:', error);
      return res.status(500).json({ error: 'Failed to delete event' });
    }
  }
}