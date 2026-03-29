import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import type { LoginInput } from '../../schemas/auth.schema';
import { Role } from '@prisma/client';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function signAccessToken(userId: string, role: Role): string {
  return jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_TTL } as jwt.SignOptions);
}

function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_TTL } as jwt.SignOptions);
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
  };
}

export class AuthService {
  async login(input: LoginInput, ipAddress: string, userAgent: string): Promise<{ user: object; tokens: TokenPair }> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);

    // Store refresh token as session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress,
        userAgent,
      },
    });

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens: { accessToken, refreshToken } };
  }

  async refresh(oldRefreshToken: string): Promise<TokenPair> {
    // Verify token
    const decoded = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as { userId: string };

    // Find session (refresh token rotation — invalidate old)
    const session = await prisma.session.findUnique({ where: { token: oldRefreshToken } });
    if (!session || session.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) throw new Error('User not found');

    // Rotate: delete old session, create new
    await prisma.session.delete({ where: { token: oldRefreshToken } });

    const newAccessToken = signAccessToken(user.id, user.role);
    const newRefreshToken = signRefreshToken(user.id);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    if (refreshToken) {
      await prisma.session.deleteMany({ where: { token: refreshToken } });
    }
  }

  cookieOptions = cookieOptions;
}

export const authService = new AuthService();
