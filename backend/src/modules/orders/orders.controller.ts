import { Request, Response } from 'express';
import { ordersService } from './orders.service';
import { Role } from '@prisma/client';

export const ordersController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const result = await ordersService.findAll(req.user!.id, req.user!.role, req.query as never);
    res.json({ success: true, data: result.orders, meta: { hasMore: result.hasMore } });
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const order = await ordersService.findById(req.params.id);
      res.json({ success: true, data: order });
    } catch (e: unknown) {
      res.status(404).json({ success: false, error: (e as Error).message });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const order = await ordersService.create(req.body, req.user!.id);
      res.status(201).json({ success: true, data: order });
    } catch (e: unknown) {
      res.status(400).json({ success: false, error: (e as Error).message });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    const order = await ordersService.update(req.params.id, req.body);
    res.json({ success: true, data: order });
  },

  async delete(req: Request, res: Response): Promise<void> {
    await ordersService.delete(req.params.id);
    res.json({ success: true, message: 'Order deleted' });
  },

  async transitionStage(req: Request, res: Response): Promise<void> {
    try {
      const order = await ordersService.transitionStage(
        req.params.id, req.body, req.user!.id, req.user!.role as Role
      );
      res.json({ success: true, data: order });
    } catch (e: unknown) {
      console.error('Transition Error:', (e as Error).message);
      res.status(400).json({ success: false, error: (e as Error).message });
    }
  },

  async getTimeline(req: Request, res: Response): Promise<void> {
    const logs = await ordersService.getTimeline(req.params.id);
    res.json({ success: true, data: logs });
  },

  async getProfit(req: Request, res: Response): Promise<void> {
    try {
      const profit = await ordersService.getProfit(req.params.id);
      res.json({ success: true, data: profit });
    } catch (e: unknown) {
      res.status(400).json({ success: false, error: (e as Error).message });
    }
  },

  async addExpense(req: Request, res: Response): Promise<void> {
    const expense = await ordersService.addExpense(req.params.id, req.body, req.user!.id);
    res.status(201).json({ success: true, data: expense });
  },
};
