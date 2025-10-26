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
  reason?: string;
}

// Core entity interfaces
export interface User {
  id: number;
  githubId: string;
  username: string;
  email?: string | null;
  avatarUrl?: string | null;
  githubUrl?: string | null;
  role: UserRole;
  isActive: boolean;
  isLead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: number;
  userId: number;
  fullName?: string | null;
  bio?: string | null;
  roleTitle?: string | null;
  devStack?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: number;
  name: string;
  category?: string | null;
}

export interface MemberSkill {
  memberId: number;
  skillId: number;
  member: Member;
  skill: Skill;
}

export interface Tag {
  id: number;
  name: string;
}

export interface ProjectTag {
  projectId: number;
  tagId: number;
  project: Project;
  tag: Tag;
}

export interface Project {
  id: number;
  memberId: number;
  title: string;
  description?: string | null;
  githubUrl?: string | null;
  liveUrl?: string | null;
  imageUrl?: string | null;
  category?: ProjectCategory | null;
  isApproved: boolean;
  isRejected: boolean;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: number;
  title: string;
  description?: string | null;
  eventDate: Date;
  location?: string | null;
  imageUrl?: string | null;
  registrationUrl?: string | null;
  isFeatured: boolean;
  isUpcoming: boolean;
  createdBy?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Extended interfaces with relations
export interface ProjectWithRelations extends Project {
  tags: {
    tag: {
      id: number;
      name: string;
    };
  }[];
  member?: Member & {
    user: User;
  };
}

export interface MemberWithRelations extends Member {
  user: User;
  skills: (MemberSkill & {
    skill: Skill;
  })[];
  projects: (Project & {
    tags: (ProjectTag & {
      tag: Tag;
    })[];
  })[];
}

export interface UserWithMember extends User {
  member?: MemberWithRelations;
}

// Legacy interfaces (can be removed if not used)
export interface ProjectWithRejection extends Project {
  rejectionReason?: string;
}

export interface EventFeaturedDTO {
  isFeatured: boolean;
}

export interface JWTPayload {
  userId: number;
  role: string;
}

// Query interfaces
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
