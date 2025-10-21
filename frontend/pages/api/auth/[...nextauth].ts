import NextAuth, { type NextAuthOptions, type User } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id?: number;
    role?: string;
    accessToken?: string;
  }

  interface Session {
    user?: {
      id?: number;
      role?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: number;
    role?: string;
    accessToken?: string;
  }
}

interface GithubProfile {
  id: number;
  login: string;
  email: string | null;
  avatar_url: string;
  html_url: string;
  name: string | null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user, account, profile: rawProfile }) {
      if (account?.provider === 'github' && rawProfile) {
        try {
          const profile = rawProfile as unknown as GithubProfile;

          // Try to call backend, but don't fail sign-in if backend is unavailable
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/github`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  githubId: String(profile.id),
                  username: profile.login,
                  email: profile.email,
                  avatarUrl: profile.avatar_url,
                  githubUrl: profile.html_url,
                }),
                signal: AbortSignal.timeout(5000),
              }
            );

            if (response.ok) {
              const userData = await response.json();
              user.id = userData.id;
              user.role = userData.role;
              user.accessToken = userData.token;
            } else {
              console.warn('Backend auth endpoint returned error:', response.status);
              // Still allow sign-in even if backend fails, user can still authenticate
              user.id = profile.id;
              user.role = 'PENDING';
            }
          } catch (backendError) {
            console.warn('Backend unavailable during sign-in, continuing with GitHub data:', backendError);
            // If backend is unavailable, create minimal user object from GitHub data
            user.id = profile.id;
            user.role = 'PENDING';
          }
        } catch (error) {
          console.error('Unexpected error during sign in:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
