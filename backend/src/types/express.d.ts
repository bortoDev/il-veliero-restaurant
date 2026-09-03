import { IUser, UserRole } from '../models/User';

export interface AuthenticatedUserPayload {
  id: string;
  _id?: any;
  email: string;
  role: UserRole;
  name: string;
  isActive?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser | AuthenticatedUserPayload | any;
      token?: string;
    }
  }
}
