import { prisma } from '../config/database';

export class CapacityService {
  /**
   * Checks availability for a given month and unit requirement
   */
  async checkAvailability(year: number, month: number, requestedUnits: number) {
    const capacity = await prisma.monthlyCapacity.findUnique({
      where: { year_month: { year, month } },
    });

    if (!capacity) return { available: true, remaining: 1000 }; // Default if record missing

    const remaining = capacity.maxUnits - (capacity.bookedUnits + capacity.reservedUnits);
    return {
      available: remaining >= requestedUnits,
      maxUnits: capacity.maxUnits,
      bookedUnits: capacity.bookedUnits,
      reservedUnits: capacity.reservedUnits,
      remaining,
    };
  }

  /**
   * Books capacity for an order
   */
  async bookCapacity(orderId: string, year: number, month: number, units: number) {
    return prisma.$transaction(async (tx) => {
      // 1. Create booking record
      const booking = await tx.capacityBooking.create({
        data: { orderId, year, month, units },
      });

      // 2. Update monthly capacity
      await tx.monthlyCapacity.update({
        where: { year_month: { year, month } },
        data: { bookedUnits: { increment: units } },
      });

      return booking;
    });
  }

  /**
   * Reserves capacity (tentative)
   */
  async reserveCapacity(year: number, month: number, units: number) {
    return prisma.monthlyCapacity.update({
      where: { year_month: { year, month } },
      data: { reservedUnits: { increment: units } },
    });
  }
}

export const capacityService = new CapacityService();
