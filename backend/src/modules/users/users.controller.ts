import { Request, Response } from 'express';
import { usersService } from './users.service';
import { Role } from '@prisma/client';

export const usersController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const { cursor, take } = req.query as Record<string, string>;
    const result = await usersService.findAll(cursor, take ? parseInt(take) : 20);
    res.json({ success: true, data: result.users, meta: { hasMore: result.hasMore } });
  },
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = await usersService.findById(req.params.id);
      res.json({ success: true, data: user });
    } catch (e: unknown) {
      res.status(404).json({ success: false, error: (e as Error).message });
    }
  },
  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = await usersService.create(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (e: unknown) {
      res.status(400).json({ success: false, error: (e as Error).message });
    }
  },
  async update(req: Request, res: Response): Promise<void> {
    const user = await usersService.update(req.params.id, req.body);
    res.json({ success: true, data: user });
  },
  async delete(req: Request, res: Response): Promise<void> {
    await usersService.delete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  },
  async changeRole(req: Request, res: Response): Promise<void> {
    const user = await usersService.changeRole(req.params.id, req.body.role as Role);
    res.json({ success: true, data: user });
  },
  async activate(req: Request, res: Response): Promise<void> {
    const user = await usersService.setActive(req.params.id, true);
    res.json({ success: true, data: user });
  },
  async deactivate(req: Request, res: Response): Promise<void> {
    const user = await usersService.setActive(req.params.id, false);
    res.json({ success: true, data: user });
  },
};
