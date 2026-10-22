import { db } from '../../config/db.js';
import { eq } from 'drizzle-orm';
import { users } from '../../config/schema.js';
import type { IAuthRepository, DbUserRow } from '../../domain/auth/IAuthRepository.js';

export const authRepository: IAuthRepository = {
  findByEmail(email: string): DbUserRow | undefined {
    const user = db.select().from(users).where(eq(users.email, email)).get();
    if (!user) return undefined;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.passwordHash,
      created_at: user.createdAt ?? undefined,
    };
  },
  findById(id: number): DbUserRow | undefined {
    const user = db.select().from(users).where(eq(users.id, id)).get();
    if (!user) return undefined;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.passwordHash,
      created_at: user.createdAt ?? undefined,
    };
  },
  createUser(name: string, email: string, passwordHash: string): number {
    const result = db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
      })
      .returning({ id: users.id })
      .get();
    return result.id;
  },
};
