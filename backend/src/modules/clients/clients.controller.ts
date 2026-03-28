import { Request, Response } from 'express';
import { clientsService } from './clients.service';

export const clientsController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const { search, cursor, take } = req.query as Record<string, string>;
    const result = await clientsService.findAll(search, cursor, take ? parseInt(take) : 20);
    res.json({ success: true, data: result.clients, meta: { hasMore: result.hasMore } });
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const client = await clientsService.findById(req.params.id);
      res.json({ success: true, data: client });
    } catch (e: unknown) {
      res.status(404).json({ success: false, error: (e as Error).message });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    const client = await clientsService.create(req.body);
    res.status(201).json({ success: true, data: client });
  },

  async update(req: Request, res: Response): Promise<void> {
    const client = await clientsService.update(req.params.id, req.body);
    res.json({ success: true, data: client });
  },

  async getOrders(req: Request, res: Response): Promise<void> {
    const result = await clientsService.getOrders(req.params.id);
    res.json({ success: true, data: result.orders, meta: { hasMore: result.hasMore } });
  },
};
