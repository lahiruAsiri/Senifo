import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';

export class AnalyticsController {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getOverviewStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getRevenueStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = 'last_30_days' } = req.query;
      const stats = await analyticsService.getRevenueAnalytics(period as string);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getOrderDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getOrderStageDistribution();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getCapacityUtilization(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, month } = req.query;
      const stats = await analyticsService.getCapacityStats(Number(year), Number(month));
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getDesignerPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getDesignerStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
