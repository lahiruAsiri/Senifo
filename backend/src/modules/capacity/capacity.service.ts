import { prisma } from '../../config/database';
import { MonthlyCapacityInput } from '../../schemas/capacity.schema';

export class CapacityModuleService {
  async getAvailability(year: number, month: number) {
    const capacity = await prisma.monthlyCapacity.findUnique({
      where: { year_month: { year, month } },
    });
    
    if (!capacity) return { maxUnits: 1000, bookedUnits: 0, reservedUnits: 0, available: true };
    
    const remaining = capacity.maxUnits - (capacity.bookedUnits + capacity.reservedUnits);
    return {
      ...capacity,
      remaining,
      available: remaining > 0
    };
  }

  async getMonthlyRecord(year: number, month: number) {
    return prisma.monthlyCapacity.findUnique({
      where: { year_month: { year, month } },
    });
  }

  async upsertRecord(data: MonthlyCapacityInput) {
    const { year, month, ...rest } = data;
    return prisma.monthlyCapacity.upsert({
      where: { year_month: { year, month } },
      create: { year, month, ...rest },
      update: rest,
    });
  }

  async listForYear(year: number) {
    return prisma.monthlyCapacity.findMany({
      where: { year },
      orderBy: { month: 'asc' },
    });
  }
}

export const capacityModuleService = new CapacityModuleService();
