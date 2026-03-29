import { Request, Response } from 'express';
import { authService } from './auth.service';
import { LoginInput } from '../../schemas/auth.schema';

const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body as LoginInput;
    try {
      const { user, tokens } = await authService.login(
        { email, password },
        req.ip ?? '',
        req.get('user-agent') ?? ''
      );

      res
        .cookie('accessToken', tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: ACCESS_TTL_MS,
        })
        .cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: REFRESH_TTL_MS,
          path: '/api/auth/refresh',
        })
        .json({ success: true, data: { user }, message: 'Login successful' });
    } catch (error: unknown) {
      res.status(401).json({ success: false, error: (error as Error).message });
    }
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const oldRefreshToken = req.cookies?.refreshToken;
    if (!oldRefreshToken) {
      res.status(401).json({ success: false, error: 'No refresh token' });
      return;
    }
    try {
      const tokens = await authService.refresh(oldRefreshToken);
      res
        .cookie('accessToken', tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: ACCESS_TTL_MS,
        })
        .cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: REFRESH_TTL_MS,
          path: '/api/auth/refresh',
        })
        .json({ success: true, message: 'Token refreshed' });
    } catch (error: unknown) {
      res.status(401).json({ success: false, error: (error as Error).message });
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.refreshToken;
    await authService.logout(refreshToken);
    res
      .clearCookie('accessToken')
      .clearCookie('refreshToken', { path: '/api/auth/refresh' })
      .json({ success: true, message: 'Logged out' });
  },

  async me(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: req.user });
  },
};
