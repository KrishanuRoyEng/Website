import { Router, Request, Response } from 'express';
import prisma from '../config/database';

const router = Router();

// Test database connection
router.get('/db', async (req: Request, res: Response) => {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    const memberCount = await prisma.member.count();
    const projectCount = await prisma.project.count();
    const eventCount = await prisma.event.count();
    const skillCount = await prisma.skill.count();
    const tagCount = await prisma.tag.count();

    res.json({
      status: 'connected',
      database: 'PostgreSQL',
      counts: {
        users: userCount,
        members: memberCount,
        projects: projectCount,
        events: eventCount,
        skills: skillCount,
        tags: tagCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Test creating a skill
router.post('/create-skill', async (req: Request, res: Response) => {
  try {
    const { name, category } = req.body;
    
    const skill = await prisma.skill.create({
      data: {
        name: name || `Test Skill ${Date.now()}`,
        category: category || 'Test',
      },
    });

    res.json({
      status: 'success',
      message: 'Skill created successfully',
      skill,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Test fetching all skills
router.get('/skills', async (req: Request, res: Response) => {
  try {
    const skills = await prisma.skill.findMany();

    res.json({
      status: 'success',
      count: skills.length,
      skills,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Test creating a tag
router.post('/create-tag', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    const tag = await prisma.tag.create({
      data: {
        name: name || `Test Tag ${Date.now()}`,
      },
    });

    res.json({
      status: 'success',
      message: 'Tag created successfully',
      tag,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Test environment variables
router.get('/config', (req: Request, res: Response) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    databaseConfigured: !!process.env.DATABASE_URL,
    jwtConfigured: !!process.env.JWT_SECRET,
    githubConfigured: !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
    port: process.env.PORT || 5000,
  });
});

export default router;