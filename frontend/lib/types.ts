export type UserRole = "ADMIN" | "MEMBER" | "PENDING";
export type ProjectCategory = "WEB" | "AI" | "UIUX";

export interface User {
  id: number;
  githubId: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  githubUrl?: string;
  role: UserRole;
  isActive: boolean;
  isLead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: number;
  userId: number;
  fullName?: string;
  bio?: string;
  roleTitle?: string;
  devStack?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  user: User;
  skills: MemberSkill[];
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: number;
  name: string;
  category?: string;
}

export interface MemberSkill {
  memberId: number;
  skillId: number;
  member: Member;
  skill: Skill;
}

export interface Project {
  id: number;
  memberId: number;
  title: string;
  description?: string;
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  category?: ProjectCategory;
  isApproved: boolean;
  isRejected: boolean;
  rejectionReason?: string;
  tags: ProjectTag[];
  createdAt: string;
  updatedAt: string;
  member?: Member;
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

export interface Event {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
  imageUrl?: string;
  registrationUrl?: string;
  isFeatured: boolean;
  isUpcoming: boolean;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectUI extends Omit<Project, "tags"> {
  tags: string[];
}

export const toProjectUI = (p: Project): ProjectUI => ({
  ...p,
  tags: p.tags.map((t) => (typeof t === "string" ? t : t.tag.name)),
});

export interface ProjectWithRelations extends Project {
  member: Member;
  tags: ProjectTag[];
}

