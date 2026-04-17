export type Role = 'USER' | 'ADMIN' | 'TECHNICIAN' | 'MANAGER';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  pictureUrl: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}
