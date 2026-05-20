import { Request } from 'express';

export type TUserRole = 'contributor' | 'maintainer';
export type TIssueType = 'bug' | 'feature_request';
export type TIssueStatus = 'open' | 'in_progress' | 'resolved';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: TUserRole;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic extends Omit<User, 'password'> {}

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: TIssueType;
  status: TIssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ReporterPublic {
  id: number;
  name: string;
  role: TUserRole;
}

export interface IssueWithReporter extends Omit<Issue, 'reporter_id'> {
  reporter: ReporterPublic;
}

export interface JwtPayload {
  id: number;
  name: string;
  role: TUserRole;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}