import { prisma } from '../../config/database';
import { OrderStatus, Role } from '@prisma/client';
import { generateOrderNumber } from '../../utils/orderNumber';
import { calculateProfit } from '../../utils/profitCalc';
import type { CreateOrderInput, StageTransitionInput, AddOrderExpenseInput, ListOrdersQuery } from '../../schemas/order.schema';

const ORDER_INCLUDE = {
  client: true,
  service: { include: { pricingTiers: true } },
  coordinator: { select: { id: true, name: true, email: true, role: true } },
  designer: { select: { id: true, name: true, email: true, role: true } },
  productionUser: { select: { id: true, name: true, email: true, role: true } },
  orderImages: true,
  stageLogs: { 
    orderBy: { createdAt: 'asc' as const },
    include: { changedBy: { select: { name: true, role: true } } }
  },
  tickets: { include: { raisedBy: { select: { id: true, name: true, role: true } } } },
  stageExpenses: { include: { recordedByUser: { select: { name: true } } } },
};

// Role → valid transition map
const TRANSITION_RULES: Record<string, { from: OrderStatus; to: OrderStatus; roles: Role[] }> = {
  'PENDING->DESIGN_QUEUE': { from: 'PENDING', to: 'DESIGN_QUEUE', roles: ['CLIENT_COORDINATOR'] },
  'DESIGN_QUEUE->DESIGNING': { from: 'DESIGN_QUEUE', to: 'DESIGNING', roles: ['DESIGNER'] },
  'DESIGNING->DESIGN_REVIEW': { from: 'DESIGNING', to: 'DESIGN_REVIEW', roles: ['DESIGNER'] },
  'DESIGN_REVIEW->DESIGNING': { from: 'DESIGN_REVIEW', to: 'DESIGNING', roles: ['CLIENT_COORDINATOR'] },
  'DESIGN_REVIEW->DESIGN_APPROVED': { from: 'DESIGN_REVIEW', to: 'DESIGN_APPROVED', roles: ['CLIENT_COORDINATOR'] },
  'DESIGN_APPROVED->PRODUCTION_QUEUE': { from: 'DESIGN_APPROVED', to: 'PRODUCTION_QUEUE', roles: ['CLIENT_COORDINATOR'] },
  'PRODUCTION_QUEUE->IN_PRODUCTION': { from: 'PRODUCTION_QUEUE', to: 'IN_PRODUCTION', roles: ['PRODUCTION'] },
  'IN_PRODUCTION->PRODUCTION_REVIEW': { from: 'IN_PRODUCTION', to: 'PRODUCTION_REVIEW', roles: ['PRODUCTION'] },
  'PRODUCTION_REVIEW->IN_PRODUCTION': { from: 'PRODUCTION_REVIEW', to: 'IN_PRODUCTION', roles: ['CLIENT_COORDINATOR'] },
  'IN_PRODUCTION->QUALITY_CHECK': { from: 'IN_PRODUCTION', to: 'QUALITY_CHECK', roles: ['PRODUCTION'] },
  'QUALITY_CHECK->PAYMENT_PENDING': { from: 'QUALITY_CHECK', to: 'PAYMENT_PENDING', roles: ['PRODUCTION'] },
  'PAYMENT_PENDING->PAYMENT_CLEARED': { from: 'PAYMENT_PENDING', to: 'PAYMENT_CLEARED', roles: ['PAYMENT_MANAGER'] },
  'PAYMENT_CLEARED->COMPLETED': { from: 'PAYMENT_CLEARED', to: 'COMPLETED', roles: ['PAYMENT_MANAGER'] },
};

// Notification triggers per transition
async function triggerNotifications(orderId: string, orderNumber: string, toStatus: OrderStatus): Promise<void> {
  const notifications: { userId: string; title: string; body: string; type: string; entityId: string }[] = [];

  const getUsersByRole = async (role: Role) => {
    return prisma.user.findMany({ where: { role, isActive: true }, select: { id: true } });
  };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { coordinatorId: true, designerId: true, productionUserId: true },
  });

  if (toStatus === 'DESIGN_QUEUE' && order?.designerId) {
    notifications.push({
      userId: order.designerId,
      title: 'New Order Assigned',
      body: `Order ${orderNumber} is ready for design`,
      type: 'ORDER_STAGE',
      entityId: orderId,
    });
  } else if (toStatus === 'DESIGN_QUEUE') {
    const designers = await getUsersByRole('DESIGNER');
    designers.forEach(d => notifications.push({
      userId: d.id, title: 'New Design Order', body: `Order ${orderNumber} awaiting designer`,
      type: 'ORDER_STAGE', entityId: orderId,
    }));
  }

  if (toStatus === 'PRODUCTION_QUEUE') {
    const prodUsers = await getUsersByRole('PRODUCTION');
    prodUsers.forEach(u => notifications.push({
      userId: u.id, title: 'New Production Order', body: `Order ${orderNumber} ready for production`,
      type: 'ORDER_STAGE', entityId: orderId,
    }));
  }

  if (toStatus === 'PAYMENT_PENDING') {
    const pmUsers = await getUsersByRole('PAYMENT_MANAGER');
    pmUsers.forEach(u => notifications.push({
      userId: u.id, title: 'Payment Required', body: `Order ${orderNumber} awaiting payment`,
      type: 'ORDER_STAGE', entityId: orderId,
    }));
  }

  if (toStatus === 'COMPLETED') {
    const admins = await getUsersByRole('SUPER_ADMIN');
    admins.forEach(u => notifications.push({
      userId: u.id, title: 'Order Completed', body: `Order ${orderNumber} has been completed`,
      type: 'ORDER_COMPLETE', entityId: orderId,
    }));
    if (order?.coordinatorId) {
      notifications.push({
        userId: order.coordinatorId, title: 'Order Completed',
        body: `Order ${orderNumber} is complete`, type: 'ORDER_COMPLETE', entityId: orderId,
      });
    }
  }

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }
}

export class OrdersService {
  async findAll(userId: string, role: Role, query: ListOrdersQuery) {
    const { cursor, take, status, coordinatorId, designerId, clientId, search, dateFrom, dateTo } = query;

    // Row-level filtering by role
    const roleFilter = role === 'SUPER_ADMIN'
      ? {}
      : role === 'CLIENT_COORDINATOR'
      ? { coordinatorId: userId }
      : role === 'DESIGNER'
      ? { designerId: userId }
      : role === 'PRODUCTION'
      ? { status: { in: ['PRODUCTION_QUEUE', 'IN_PRODUCTION', 'PRODUCTION_REVIEW', 'QUALITY_CHECK'] as OrderStatus[] } }
      : role === 'PAYMENT_MANAGER'
      ? { status: { in: ['PAYMENT_PENDING', 'PAYMENT_CLEARED', 'COMPLETED'] as OrderStatus[] } }
      : {};

    const where = {
      ...roleFilter,
      ...(status ? (Array.isArray(status) ? { status: { in: status } } : { status }) : {}),
      ...(coordinatorId ? { coordinatorId } : {}),
      ...(designerId ? { designerId } : {}),
      ...(clientId ? { clientId } : {}),
      ...(dateFrom || dateTo ? {
        orderDate: {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: new Date(dateTo) } : {}),
        },
      } : {}),
      ...(search ? {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' as const } },
          { client: { name: { contains: search, mode: 'insensitive' as const } } },
        ],
      } : {}),
    };

    const orders = await prisma.order.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        service: { select: { id: true, name: true, printType: true } },
        coordinator: { select: { id: true, name: true } },
        designer: { select: { id: true, name: true } },
      },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
    return { orders, hasMore: orders.length === take };
  }

  async findById(id: string) {
    const order = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!order) throw new Error('Order not found');
    return order;
  }

  async create(input: CreateOrderInput, coordinatorId: string) {
    const orderNumber = await generateOrderNumber();
    const order = await prisma.order.create({
      data: { ...input, coordinatorId, orderNumber },
      include: ORDER_INCLUDE,
    });

    // Notify SUPER_ADMIN about new order
    const admins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN', isActive: true }, select: { id: true },
    });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(a => ({
          userId: a.id, title: 'New Order Created',
          body: `Order ${orderNumber} created`, type: 'ORDER_CREATE', entityId: order.id,
        })),
      });
    }

    return order;
  }

  async update(id: string, input: Partial<CreateOrderInput>) {
    return prisma.order.update({ where: { id }, data: input, include: ORDER_INCLUDE });
  }

  async delete(id: string) {
    await prisma.order.delete({ where: { id } });
  }

  async transitionStage(id: string, input: StageTransitionInput, userId: string, userRole: Role) {
    const order = await prisma.order.findUnique({ where: { id }, select: { status: true, orderNumber: true, serviceId: true, quantity: true, totalAmount: true, discountAmount: true, paidAmount: true } });
    if (!order) throw new Error('Order not found');

    const transitionKey = `${order.status}->${input.toStatus}`;
    const rule = TRANSITION_RULES[transitionKey];

    if (!rule) throw new Error(`Invalid transition: ${transitionKey}`);

    // SUPER_ADMIN bypasses role check
    if (userRole !== 'SUPER_ADMIN' && !rule.roles.includes(userRole)) {
      throw new Error(`Role ${userRole} cannot perform this transition`);
    }

    return prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {
        status: input.toStatus,
        ...(input.designerId ? { designerId: input.designerId } : {}),
        ...(input.productionUserId ? { productionUserId: input.productionUserId } : {}),
      };

      // Calculate profit when completing order
      if (input.toStatus === 'COMPLETED') {
        const profitResult = await calculateProfit({
          orderId: id,
          totalAmount: Number(order.totalAmount),
          discountAmount: Number(order.discountAmount),
          paidAmount: Number(order.paidAmount),
          quantity: order.quantity,
          serviceId: order.serviceId,
        });
        Object.assign(updateData, {
          actualCost: profitResult.totalCost,
          profit: profitResult.profit,
          balanceAmount: profitResult.balanceAmount,
          actualDelivery: new Date(),
        });
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: updateData,
        include: ORDER_INCLUDE,
      });

      await tx.orderStageLog.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: input.toStatus,
          changedById: userId,
          notes: input.notes,
        },
      });

      return updatedOrder;
    }).then(async (updatedOrder) => {
      // Trigger notifications outside transaction (non-blocking)
      await triggerNotifications(id, order.orderNumber, input.toStatus);
      return updatedOrder;
    });
  }

  async getTimeline(orderId: string) {
    return prisma.orderStageLog.findMany({
      where: { orderId },
      include: { changedBy: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getProfit(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { serviceId: true, quantity: true, totalAmount: true, discountAmount: true, paidAmount: true },
    });
    if (!order) throw new Error('Order not found');
    return calculateProfit({
      orderId,
      totalAmount: Number(order.totalAmount),
      discountAmount: Number(order.discountAmount),
      paidAmount: Number(order.paidAmount),
      quantity: order.quantity,
      serviceId: order.serviceId,
    });
  }

  async addExpense(orderId: string, input: AddOrderExpenseInput, recordedBy: string) {
    return prisma.stageExpense.create({
      data: { orderId, ...input, recordedBy },
    });
  }
}

export const ordersService = new OrdersService();
