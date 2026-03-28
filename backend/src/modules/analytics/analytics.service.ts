import { prisma } from '../../config/database';
import { startOfMonth, endOfMonth, subDays, startOfDay } from 'date-fns';

export class AnalyticsService {
  async getOverviewStats() {
    const [totalOrders, pendingOrders, totalRevenue, totalProfit] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.aggregate({ _sum: { profit: true } }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalProfit: totalProfit._sum.profit || 0,
    };
  }

  async getRevenueAnalytics(period: string) {
    const now = new Date();
    let startDate: Date;

    if (period === 'last_7_days') startDate = subDays(startOfDay(now), 7);
    else if (period === 'last_30_days') startDate = subDays(startOfDay(now), 30);
    else startDate = startOfMonth(now);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate }, status: 'COMPLETED' },
      select: { createdAt: true, totalAmount: true, actualCost: true, profit: true },
    });

    // Grouping logic (simplified)
    return orders;
  }

  async getOrderStageDistribution() {
    const counts = await prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    return counts.map((c) => ({ stage: c.status, count: c._count._all }));
  }

  async getCapacityStats(year: number, month: number) {
    const capacity = await prisma.monthlyCapacity.findUnique({
      where: { year_month: { year, month } },
    });
    return capacity;
  }

  async getDesignerStats() {
    return prisma.user.findMany({
      where: { role: 'DESIGNER' },
      select: {
        id: true,
        name: true,
        _count: {
          select: { ordersDesigned: true },
        },
      },
    });
  }
}

export const analyticsService = new AnalyticsService();
