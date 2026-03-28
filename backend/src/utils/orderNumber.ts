import { prisma } from '../config/database';

export async function generateOrderNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();

  const result = await prisma.$transaction(async (tx) => {
    const counter = await tx.orderCounter.upsert({
      where: { id: 'singleton' },
      update: {
        count: {
          increment: 1,
        },
        year: currentYear,
      },
      create: {
        id: 'singleton',
        year: currentYear,
        count: 1,
      },
    });

    // Reset counter if year changed
    if (counter.year !== currentYear) {
      const updated = await tx.orderCounter.update({
        where: { id: 'singleton' },
        data: { year: currentYear, count: 1 },
      });
      return updated;
    }
    return counter;
  });

  const paddedCount = String(result.count).padStart(4, '0');
  return `SNF-${result.year}-${paddedCount}`;
}
