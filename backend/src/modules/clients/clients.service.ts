import { prisma } from '../../config/database';
import type { CreateClientInput } from '../../../../shared/schemas/client.schema';

export class ClientsService {
  async findAll(search?: string, cursor?: string, take = 20) {
    const clients = await prisma.client.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { company: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
    return { clients, hasMore: clients.length === take };
  }

  async findById(id: string) {
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) throw new Error('Client not found');
    return client;
  }

  async create(input: CreateClientInput) {
    return prisma.client.create({ data: input });
  }

  async update(id: string, input: Partial<CreateClientInput>) {
    return prisma.client.update({ where: { id }, data: input });
  }

  async getOrders(clientId: string, cursor?: string, take = 20) {
    const orders = await prisma.order.findMany({
      where: { clientId },
      include: { service: true, coordinator: { select: { name: true, email: true } } },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
    return { orders, hasMore: orders.length === take };
  }
}

export const clientsService = new ClientsService();
