import { prisma } from '../config/database';

interface ProfitCalcInput {
  orderId: string;
  totalAmount: number;
  discountAmount: number;
  paidAmount: number;
  quantity: number;
  serviceId: string;
}

export interface ProfitResult {
  grossRevenue: number;
  productionCost: number;
  deliveryCost: number;
  stageExpensesTotal: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  balanceAmount: number;
}

export async function calculateProfit(input: ProfitCalcInput): Promise<ProfitResult> {
  const { orderId, totalAmount, discountAmount, paidAmount, quantity, serviceId } = input;

  // Get pricing tier for this order
  const pricingTier = await prisma.pricingTier.findFirst({
    where: {
      serviceId,
      minQuantity: { lte: quantity },
      OR: [
        { maxQuantity: null },
        { maxQuantity: { gte: quantity } },
      ],
      isActive: true,
    },
    orderBy: { minQuantity: 'desc' },
  });

  if (!pricingTier) {
    throw new Error('No applicable pricing tier found for this order');
  }

  // Get stage expenses
  const expenses = await prisma.stageExpense.aggregate({
    where: { orderId },
    _sum: { amount: true },
  });

  const grossRevenue = totalAmount - discountAmount;
  const productionCost = Number(pricingTier.actualCostPerUnit) * quantity;
  const deliveryCost = Number(pricingTier.deliveryCostFlat);
  const stageExpensesTotal = Number(expenses._sum.amount ?? 0);
  const totalCost = productionCost + deliveryCost + stageExpensesTotal;
  const profit = grossRevenue - totalCost;
  const profitMargin = grossRevenue > 0 ? (profit / grossRevenue) * 100 : 0;
  const balanceAmount = totalAmount - discountAmount - paidAmount;

  return {
    grossRevenue,
    productionCost,
    deliveryCost,
    stageExpensesTotal,
    totalCost,
    profit,
    profitMargin,
    balanceAmount,
  };
}
