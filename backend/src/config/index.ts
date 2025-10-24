import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
] as const;


for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1); 
  }
}

export interface Config {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  jwt: {
    secret: string;
    expire: string;
  };
  github: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  frontend: {
    url: string;
  };
  database: {
    url: string;
  };
}

export const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  
  nodeEnv: (process.env.NODE_ENV || 'development') as Config['nodeEnv'],
  
  jwt: {
    secret: process.env.JWT_SECRET!,
    expire: process.env.JWT_EXPIRE || '7d',
  },
  
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback',
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3001',
  },
  
  database: {
    url: process.env.DATABASE_URL!,
  },
} as Config;