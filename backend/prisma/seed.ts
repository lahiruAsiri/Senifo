import { PrismaClient, Role, PrintType, OrderStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Clear existing data
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.ticketAttachment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.orderImage.deleteMany();
  await prisma.stageExpense.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderStageLog.deleteMany();
  await prisma.capacityBooking.deleteMany();
  await prisma.order.deleteMany();
  await prisma.monthlyCapacity.deleteMany();
  await prisma.pricingTier.deleteMany();
  await prisma.printingService.deleteMany();
  await prisma.client.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.orderCounter.deleteMany();

  // 2. Create Users
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const coordHash = await bcrypt.hash('Coord@123', 12);
  const designHash = await bcrypt.hash('Design@123', 12);
  const prodHash = await bcrypt.hash('Prod@123', 12);
  const payHash = await bcrypt.hash('Pay@123', 12);

  const superAdmin = await prisma.user.create({
    data: { email: 'superadmin@senifo.com', name: 'Super Admin', role: Role.SUPER_ADMIN, passwordHash }
  });

  const coordinator = await prisma.user.create({
    data: { email: 'coordinator@senifo.com', name: 'Asiri Coordinator', role: Role.CLIENT_COORDINATOR, passwordHash: coordHash }
  });

  const designer = await prisma.user.create({
    data: { email: 'designer@senifo.com', name: 'Gamage Designer', role: Role.DESIGNER, passwordHash: designHash }
  });

  const production = await prisma.user.create({
    data: { email: 'production@senifo.com', name: 'Prod Master', role: Role.PRODUCTION, passwordHash: prodHash }
  });

  const paymentManager = await prisma.user.create({
    data: { email: 'payment@senifo.com', name: 'Financial Hero', role: Role.PAYMENT_MANAGER, passwordHash: payHash }
  });

  console.log('✅ Users created');

  // 3. Create Printing Services & Pricing Tiers
  const screenPrint = await prisma.printingService.create({
    data: {
      name: 'Screen Printing',
      printType: PrintType.SCREEN_PRINT,
      description: 'High durability screen printing for large orders',
      pricingTiers: {
        create: [
          { minQuantity: 1, maxQuantity: 49, pricePerUnit: 350, actualCostPerUnit: 180, deliveryCostFlat: 500 },
          { minQuantity: 50, maxQuantity: 199, pricePerUnit: 280, actualCostPerUnit: 150, deliveryCostFlat: 800 },
          { minQuantity: 200, maxQuantity: null, pricePerUnit: 220, actualCostPerUnit: 120, deliveryCostFlat: 1200 },
        ]
      }
    }
  });

  const dtgPrint = await prisma.printingService.create({
    data: {
      name: 'DTG Printing',
      printType: PrintType.DTG,
      description: 'High detail direct-to-garment printing',
      pricingTiers: {
        create: [
          { minQuantity: 1, maxQuantity: 24, pricePerUnit: 500, actualCostPerUnit: 280, deliveryCostFlat: 500 },
          { minQuantity: 25, maxQuantity: 99, pricePerUnit: 420, actualCostPerUnit: 240, deliveryCostFlat: 800 },
          { minQuantity: 100, maxQuantity: null, pricePerUnit: 360, actualCostPerUnit: 200, deliveryCostFlat: 1000 },
        ]
      }
    }
  });

  console.log('✅ Services and Pricing created');

  // 4. Monthly Capacity
  const now = new Date();
  await prisma.monthlyCapacity.create({
    data: { year: now.getFullYear(), month: now.getMonth() + 1, maxUnits: 1000, maxOrders: 50 }
  });

  // 5. Clients
  const client1 = await prisma.client.create({
    data: { name: 'Tech Corp', phone: '0711234567', whatsapp: '0711234567', email: 'hello@techcorp.com', company: 'Tech Corp PLC' }
  });

  const client2 = await prisma.client.create({
    data: { name: 'Fashion Hub', phone: '0777654321', whatsapp: '0777654321', email: 'sales@fashionhub.lk', company: 'Fashion Hub (Pvt) Ltd' }
  });

  const client3 = await prisma.client.create({
    data: { name: 'School Sports', phone: '0112233445' }
  });

  console.log('✅ Clients created');

  // 6. Sample Orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'SNF-2024-0001',
      clientId: client1.id,
      serviceId: screenPrint.id,
      coordinatorId: coordinator.id,
      designerId: designer.id,
      status: OrderStatus.DESIGNING,
      quantity: 100,
      tshirtType: 'Crew Neck Cotton',
      sizes: { M: 50, L: 50 },
      colors: ['Navy Blue'],
      unitPrice: 280,
      totalAmount: 28800, // (100 * 280) + 800 delivery
      expectedDelivery: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    }
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'SNF-2024-0002',
      clientId: client2.id,
      serviceId: dtgPrint.id,
      coordinatorId: coordinator.id,
      status: OrderStatus.PENDING,
      quantity: 10,
      tshirtType: 'Polo Shirt',
      sizes: { S: 5, M: 5 },
      colors: ['White'],
      unitPrice: 500,
      totalAmount: 5500, // (10 * 500) + 500 delivery
    }
  });

  console.log('✅ Sample orders created');
  console.log('🌱 Seeding COMPLETED!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
