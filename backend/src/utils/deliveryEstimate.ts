import { prisma } from '../config/database';

interface DeliveryEstimateResult {
  estimatedDays: number;
  expectedDelivery: Date;
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++;
    }
  }
  return result;
}

export async function estimateDelivery(
  quantity: number,
  orderDate: Date = new Date()
): Promise<DeliveryEstimateResult> {
  const year = orderDate.getFullYear();
  const month = orderDate.getMonth() + 1;

  const capacity = await prisma.monthlyCapacity.findUnique({
    where: { year_month: { year, month } },
  });

  if (!capacity) {
    // Default: 7 business days if no capacity configured
    const expectedDelivery = addBusinessDays(orderDate, 7);
    return { estimatedDays: 7, expectedDelivery };
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyCapacity = Math.ceil(capacity.maxUnits / daysInMonth);
  const remainingCapacity = capacity.maxUnits - capacity.bookedUnits;

  let estimatedDays: number;
  if (remainingCapacity >= quantity && dailyCapacity > 0) {
    estimatedDays = Math.ceil(quantity / dailyCapacity) + 3; // +3 buffer days
  } else {
    estimatedDays = 14; // Default if capacity is full
  }

  const expectedDelivery = addBusinessDays(orderDate, estimatedDays);
  return { estimatedDays, expectedDelivery };
}
