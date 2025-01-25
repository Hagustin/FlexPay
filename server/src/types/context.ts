import { Request } from 'express';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface GraphQLContext {
  user?: AuthUser | null;
  req: Request;
}
