import { prisma } from '../../config/database';
import { PaymentType } from '@prisma/client';
import type { RecordPaymentInput } from '../../schemas/payment.schema';

export class PaymentsService {
  async findAll(cursor?: string, take = 20) {
    const payments = await prisma.payment.findMany({
      include: { order: { select: { id: true, orderNumber: true, client: { select: { name: true } } } } },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { paymentDate: 'desc' },
    });
    return { payments, hasMore: payments.length === take };
  }

  async findById(id: string) {
    const p = await prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!p) throw new Error('Payment not found');
    return p;
  }

  async create(input: RecordPaymentInput, recordedBy: string) {
    const payment = await prisma.payment.create({
      data: { ...input, recordedBy, paymentDate: input.paymentDate ? new Date(input.paymentDate) : new Date() },
      include: { order: { select: { orderNumber: true } } },
    });

    // Update order paidAmount
    await prisma.order.update({
      where: { id: input.orderId },
      data: { paidAmount: { increment: input.amount } },
    });

    // Notify SUPER_ADMIN
    const admins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN', isActive: true }, select: { id: true } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(a => ({
          userId: a.id, title: 'Payment Recorded',
          body: `LKR ${input.amount} recorded for order ${payment.order.orderNumber}`,
          type: 'PAYMENT_RECORDED', entityId: input.orderId,
        })),
      });
    }

    return payment;
  }

  async getByOrder(orderId: string) {
    return prisma.payment.findMany({ where: { orderId }, orderBy: { paymentDate: 'desc' } });
  }
}

export const paymentsService = new PaymentsService();
