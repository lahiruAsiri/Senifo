import { Request, Response, NextFunction } from 'express';
import { capacityModuleService } from './capacity.service';
import { monthlyCapacitySchema, updateCapacitySchema, availabilityQuerySchema } from '../../../../shared/schemas/capacity.schema';

export class CapacityController {
  async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const query = availabilityQuerySchema.parse(req.query);
      const availability = await capacityModuleService.getAvailability(query.year, query.month);
      res.json({ success: true, data: availability });
    } catch (error) {
      next(error);
    }
  }

  async getMonthly(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, month } = req.params;
      const capacity = await capacityModuleService.getMonthlyRecord(Number(year), Number(month));
      res.json({ success: true, data: capacity });
    } catch (error) {
      next(error);
    }
  }

  async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const input = monthlyCapacitySchema.parse(req.body);
      const capacity = await capacityModuleService.upsertRecord(input);
      res.json({ success: true, data: capacity });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { year } = req.query;
      const list = await capacityModuleService.listForYear(year ? Number(year) : new Date().getFullYear());
      res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }
}

export const capacityController = new CapacityController();
