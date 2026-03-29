import { prisma } from '../../config/database';
import { Role, TicketStatus } from '@prisma/client';
import type { CreateTicketInput, AddTicketCommentInput } from '../../schemas/ticket.schema';

const TICKET_INCLUDE = {
  order: { select: { id: true, orderNumber: true, status: true } },
  raisedBy: { select: { id: true, name: true, role: true } },
  assignedTo: { select: { id: true, name: true, role: true } },
  comments: { include: { user: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: 'asc' as const } },
  attachments: true,
};

export class TicketsService {
  async findAll(userId: string, role: Role, status?: TicketStatus) {
    const where = role === 'SUPER_ADMIN'
      ? { ...(status ? { status } : {}) }
      : role === 'CLIENT_COORDINATOR'
      ? { status: { in: ['OPEN', 'CLIENT_RESPONDED'] as TicketStatus[] } }
      : { raisedById: userId, ...(status ? { status } : {}) };

    return prisma.ticket.findMany({
      where,
      include: TICKET_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id }, include: TICKET_INCLUDE });
    if (!ticket) throw new Error('Ticket not found');
    return ticket;
  }

  async create(input: CreateTicketInput, raisedById: string) {
    // Route all tickets to coordinators
    const coordinators = await prisma.user.findMany({
      where: { role: 'CLIENT_COORDINATOR', isActive: true }, select: { id: true },
    });

    const ticket = await prisma.ticket.create({
      data: { ...input, raisedById },
      include: TICKET_INCLUDE,
    });

    // Notify all coordinators
    if (coordinators.length > 0) {
      await prisma.notification.createMany({
        data: coordinators.map(c => ({
          userId: c.id,
          title: 'New Ticket Raised',
          body: `Ticket: ${input.title}`,
          type: 'TICKET_RAISED',
          entityId: ticket.id,
        })),
      });
    }

    return ticket;
  }

  async updateStatus(id: string, status: TicketStatus, notes?: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { raisedById: true },
    });
    
    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        status,
        ...(status === 'RESOLVED' ? { resolvedAt: new Date() } : {}),
      },
      include: TICKET_INCLUDE,
    });

    // Notify the ticket raiser when coordinator submits client feedback
    if (status === 'CLIENT_RESPONDED' && ticket) {
      await prisma.notification.create({
        data: {
          userId: ticket.raisedById, title: 'Client Feedback Received',
          body: `Ticket updated with client response${notes ? ': ' + notes : ''}`,
          type: 'TICKET_FEEDBACK', entityId: id,
        },
      });
    }

    return updated;
  }

  async addComment(ticketId: string, input: AddTicketCommentInput, userId: string) {
    return prisma.ticketComment.create({
      data: { ticketId, userId, content: input.content, isInternal: input.isInternal },
      include: { user: { select: { id: true, name: true, role: true } } },
    });
  }

  async getComments(ticketId: string) {
    return prisma.ticketComment.findMany({
      where: { ticketId },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getByOrder(orderId: string) {
    return prisma.ticket.findMany({
      where: { orderId },
      include: TICKET_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const ticketsService = new TicketsService();
