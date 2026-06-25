import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';

const ACCESS_TTL = '15m';
const REFRESH_TTL_DAYS = 30;
const SECRET = process.env.JWT_SECRET!;

export function issueTokens(userId: string) {
  const accessToken = jwt.sign({ sub: userId }, SECRET, { expiresIn: ACCESS_TTL });
  const refreshToken = randomBytes(32).toString('base64url');
  const tokenHash = hashToken(refreshToken);
  // caller persists { userId, tokenHash, expiresAt }
  return { accessToken, refreshToken, tokenHash };
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function verifyAccess(token: string) {
  return jwt.verify(token, SECRET) as { sub: string };
}
