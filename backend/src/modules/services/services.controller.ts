import { Request, Response, NextFunction } from 'express';
import { printingServicesService } from './services.service';
import { createServiceSchema, updateServiceSchema } from '../../schemas/service.schema';

export class ServicesController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const services = await printingServicesService.findAll();
      res.json({ success: true, data: services });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await printingServicesService.findById(req.params.id);
      res.json({ success: true, data: service });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createServiceSchema.parse(req.body);
      const service = await printingServicesService.create(input);
      res.json({ success: true, data: service, message: 'Service created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateServiceSchema.parse(req.body);
      const service = await printingServicesService.update(req.params.id, input);
      res.json({ success: true, data: service, message: 'Service updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await printingServicesService.delete(req.params.id);
      res.json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const servicesController = new ServicesController();
