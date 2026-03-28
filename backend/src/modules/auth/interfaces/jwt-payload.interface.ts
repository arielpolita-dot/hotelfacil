export interface JwtPayload {
  sub: string;
  email: string;
  empresaId: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface AuthUser {
  id: string;
  email: string;
  empresaId: string;
  role: string;
}
