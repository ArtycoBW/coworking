import { User } from '@prisma/client';

export type SafeUser = Omit<User, 'password'> & { name: string };

export function toSafeUser(user: User): SafeUser {
  const { password: _password, ...safeUser } = user;
  return { ...safeUser, name: `${user.firstName} ${user.lastName}`.trim() };
}
