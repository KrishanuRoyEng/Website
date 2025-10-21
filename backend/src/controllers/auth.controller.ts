import { Request, Response } from 'express';
import { GitHubService } from '../services/github.service';
import { UserService } from '../services/user.service';
import { MemberService } from '../services/member.service';
import { generateToken } from '../utils/auth';
import { AuthRequest } from '../types';

export class AuthController {
  static async githubSignIn(req: Request, res: Response) {
    try {
      const { githubId, username, email, avatarUrl, githubUrl } = req.body;

      if (!githubId || !username) {
        return res.status(400).json({ error: 'GitHub ID and username are required' });
      }

      let user = await UserService.findByGithubId(String(githubId));

      if (!user) {
        user = await UserService.create({
          githubId: String(githubId),
          username,
          email: email || undefined,
          avatarUrl: avatarUrl || undefined,
          githubUrl: githubUrl || undefined,
        });

        // Create member profile
        await MemberService.create({
          userId: user.id,
          fullName: username,
        });

        user = await UserService.findById(user.id);
      }

      if (!user) {
        return res.status(500).json({ error: 'Failed to create user' });
      }

      const token = generateToken(user.id, user.role);

      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isActive: user.isActive,
        isLead: user.isLead,
        token,
      });
    } catch (error) {
      console.error('GitHub sign-in error:', error);
      return res.status(500).json({ error: 'Sign-in failed' });
    }
  }

  static async githubCallback(req: Request, res: Response) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
      }

      const accessToken = await GitHubService.exchangeCodeForToken(code);

      const githubUser = await GitHubService.getGitHubUser(accessToken);

      let user = await UserService.findByGithubId(String(githubUser.id));

      if (!user) {
        user = await UserService.create({
          githubId: String(githubUser.id),
          username: githubUser.login,
          email: githubUser.email || undefined,
          avatarUrl: githubUser.avatar_url,
          githubUrl: githubUser.html_url,
        });

        await MemberService.create({
          userId: user.id,
          fullName: githubUser.name || undefined,
        });

        user = await UserService.findById(user.id);
      }

      if (!user) {
        return res.status(500).json({ error: 'Failed to create user' });
      }

      const token = generateToken(user.id, user.role);

      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
          isActive: user.isActive,
          isLead: user.isLead,
        },
      });
    } catch (error) {
      console.error('GitHub auth error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }

  static async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await UserService.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        githubUrl: user.githubUrl,
        role: user.role,
        isActive: user.isActive,
        isLead: user.isLead,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }
  }

  static async fetchGithubRepos(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await UserService.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const repos = await GitHubService.getUserRepos(user.username);

      return res.json(repos);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch repositories' });
    }
  }
}
