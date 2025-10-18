import axios from 'axios';
import { config } from '../config';
import { GitHubUser, GitHubRepo } from '../types';

export class GitHubService {
  private static GITHUB_API = 'https://api.github.com';
  private static GITHUB_OAUTH = 'https://github.com/login/oauth';

  static async exchangeCodeForToken(code: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.GITHUB_OAUTH}/access_token`,
        {
          client_id: config.github.clientId,
          client_secret: config.github.clientSecret,
          code,
          redirect_uri: config.github.redirectUri,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.data.access_token) {
        throw new Error('Failed to obtain access token from GitHub');
      }

      return response.data.access_token;
    } catch (error) {
      throw new Error('GitHub authentication failed');
    }
  }

  static async getGitHubUser(accessToken: string): Promise<GitHubUser> {
    try {
      const response = await axios.get<GitHubUser>(`${this.GITHUB_API}/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch GitHub user data');
    }
  }

  static async getUserRepos(username: string): Promise<GitHubRepo[]> {
    try {
      const response = await axios.get<GitHubRepo[]>(
        `${this.GITHUB_API}/users/${username}/repos`,
        {
          headers: {
            Accept: 'application/json',
          },
          params: {
            sort: 'updated',
            per_page: 100,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch GitHub repositories');
    }
  }

  static async getRepoLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    try {
      const response = await axios.get(
        `${this.GITHUB_API}/repos/${owner}/${repo}/languages`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      return {};
    }
  }
}