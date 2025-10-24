import { Request } from "express";

export type UserRole = "ADMIN" | "MEMBER" | "PENDING";
export type ProjectCategory = "WEB" | "AI" | "UIUX";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export interface GitHubUser {
  id: number;
  login: string;
  email: string | null;
  avatar_url: string;
  html_url: string;
  name: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
}

// DTOs
export interface CreateUserDTO {
  githubId: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  githubUrl?: string;
}

export interface UpdateUserDTO {
  email?: string;
  avatarUrl?: string;
}

export interface CreateMemberDTO {
  userId: number;
  fullName?: string;
  bio?: string;
  roleTitle?: string;
  devStack?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export interface UpdateMemberDTO {
  fullName?: string;
  bio?: string;
  roleTitle?: string;
  devStack?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export interface CreateProjectDTO {
  title: string;
  description?: string;
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  category?: ProjectCategory;
  tags?: string[];
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string;
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  category?: ProjectCategory;
  tags?: string[];
}

export interface CreateEventDTO {
  title: string;
  description?: string;
  eventDate: Date;
  location?: string;
  imageUrl?: string;
  registrationUrl?: string;
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  eventDate?: Date;
  location?: string;
  imageUrl?: string;
  registrationUrl?: string;
  isFeatured?: boolean;
  isUpcoming?: boolean;
}

export interface MemberApprovalDTO {
  isActive: boolean;
  role: UserRole;
  reason?: string;
}

export interface ProjectApprovalDTO {
  isApproved: boolean;
}

export interface EventFeaturedDTO {
  isFeatured: boolean;
}

export interface JWTPayload {
  userId: number;
  role: string;
}

export interface PaginationQuery {
  skip?: number;
  limit?: number;
}

export interface ProjectQuery extends PaginationQuery {
  category?: ProjectCategory;
  tagIds?: number[];
  memberId?: number;
  approvedOnly?: boolean;
}

export interface MemberQuery extends PaginationQuery {
  skillIds?: number[];
  approvedOnly?: boolean;
}

export interface EventQuery extends PaginationQuery {
  upcomingOnly?: boolean;
  featuredOnly?: boolean;
}
