export type Role = 'USER' | 'ADMIN' | 'STAFF_MEMBER' | 'STUDENT';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  pictureUrl: string | null;
  role: Role;
  studentId: string | null;
  department: string | null;
}

export interface ProfileCompletionData {
  name: string;
  email: string;
  googleSub: string;
}

export interface RegisterFormData {
  name: string;
  studentId: string;
  department: string;
  email: string;
  password: string;
  confirmPassword: string;
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
