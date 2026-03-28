import { Request, Response } from 'express';
import { ticketsService } from './tickets.service';
import { Role, TicketStatus } from '@prisma/client';

export const ticketsController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const tickets = await ticketsService.findAll(req.user!.id, req.user!.role as Role, req.query.status as TicketStatus);
    res.json({ success: true, data: tickets });
  },
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const ticket = await ticketsService.findById(req.params.id);
      res.json({ success: true, data: ticket });
    } catch (e: unknown) {
      res.status(404).json({ success: false, error: (e as Error).message });
    }
  },
  async create(req: Request, res: Response): Promise<void> {
    const ticket = await ticketsService.create(req.body, req.user!.id);
    res.status(201).json({ success: true, data: ticket });
  },
  async update(req: Request, res: Response): Promise<void> {
    const ticket = await ticketsService.updateStatus(req.params.id, req.body.status, req.body.notes);
    res.json({ success: true, data: ticket });
  },
  async updateStatus(req: Request, res: Response): Promise<void> {
    const ticket = await ticketsService.updateStatus(req.params.id, req.body.status, req.body.notes);
    res.json({ success: true, data: ticket });
  },
  async addComment(req: Request, res: Response): Promise<void> {
    const comment = await ticketsService.addComment(req.params.id, req.body, req.user!.id);
    res.status(201).json({ success: true, data: comment });
  },
  async getComments(req: Request, res: Response): Promise<void> {
    const comments = await ticketsService.getComments(req.params.id);
    res.json({ success: true, data: comments });
  },
  async getByOrder(req: Request, res: Response): Promise<void> {
    const tickets = await ticketsService.getByOrder(req.params.orderId);
    res.json({ success: true, data: tickets });
  },
};
