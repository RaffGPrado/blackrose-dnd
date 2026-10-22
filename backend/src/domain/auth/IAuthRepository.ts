export interface DbUserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at?: string;
}

export interface IAuthRepository {
  findByEmail(email: string): DbUserRow | undefined;
  findById(id: number): DbUserRow | undefined;
  createUser(name: string, email: string, passwordHash: string): number;
}
