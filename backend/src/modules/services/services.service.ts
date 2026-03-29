import { prisma } from '../../config/database';
import { CreateServiceInput, UpdateServiceInput } from '../../schemas/service.schema';

export class PrintingServicesService {
  async findAll() {
    return prisma.printingService.findMany({
      where: { isActive: true },
      include: { pricingTiers: { orderBy: { minQuantity: 'asc' } } },
    });
  }

  async findById(id: string) {
    const service = await prisma.printingService.findUnique({
      where: { id },
      include: { pricingTiers: { orderBy: { minQuantity: 'asc' } } },
    });
    if (!service) throw new Error('Service not found');
    return service;
  }

  async create(data: CreateServiceInput) {
    const { pricingTiers, ...rest } = data;
    return prisma.printingService.create({
      data: {
        ...rest,
        pricingTiers: {
          create: pricingTiers.map(tier => ({
            minQuantity: tier.minQuantity,
            maxQuantity: tier.maxQuantity,
            pricePerUnit: tier.pricePerUnit,
            actualCostPerUnit: tier.actualCostPerUnit,
            deliveryCostFlat: tier.deliveryCostFlat,
          })),
        },
      },
      include: { pricingTiers: true },
    });
  }

  async update(id: string, data: UpdateServiceInput) {
    const { pricingTiers, ...rest } = data;
    
    return prisma.$transaction(async (tx) => {
      // Update basic info
      const updated = await tx.printingService.update({
        where: { id },
        data: rest,
      });

      // Update tiers if provided (simple version: delete and recreate)
      if (pricingTiers) {
        await tx.pricingTier.deleteMany({ where: { serviceId: id } });
        await tx.pricingTier.createMany({
          data: pricingTiers.map(tier => ({
            serviceId: id,
            minQuantity: tier.minQuantity,
            maxQuantity: tier.maxQuantity || null,
            pricePerUnit: tier.pricePerUnit,
            actualCostPerUnit: tier.actualCostPerUnit,
            deliveryCostFlat: tier.deliveryCostFlat || 0,
          })),
        });
      }

      return updated;
    });
  }

  async delete(id: string) {
    // Soft delete
    return prisma.printingService.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const printingServicesService = new PrintingServicesService();
