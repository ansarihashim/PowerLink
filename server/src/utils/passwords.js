import bcrypt from 'bcrypt';

export async function hashPassword(raw) {
  const saltRounds = 12;
  return bcrypt.hash(raw, saltRounds);
}
export async function verifyPassword(raw, hash) {
  return bcrypt.compare(raw, hash);
}
