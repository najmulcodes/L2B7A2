import { Request } from 'express';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'contributor' | 'maintainer';
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: number;
  name: string;
  email: string;
  role: 'contributor' | 'maintainer';
  created_at: Date;
  updated_at: Date;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
  status: 'open' | 'in_progress' | 'resolved';
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ReporterPublic {
  id: number;
  name: string;
  role: 'contributor' | 'maintainer';
}

export interface IssueWithReporter {
  id: number;
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
  status: 'open' | 'in_progress' | 'resolved';
  reporter: ReporterPublic;
  created_at: Date;
  updated_at: Date;
}

export interface JwtPayload {
  id: number;
  name: string;
  role: 'contributor' | 'maintainer';
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}