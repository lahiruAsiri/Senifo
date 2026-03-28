import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import { generalRateLimit } from './middleware/rateLimit';
import { errorHandler, notFound } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import clientRoutes from './modules/clients/clients.routes';
import orderRoutes from './modules/orders/orders.routes';
import ticketRoutes from './modules/tickets/tickets.routes';
import paymentRoutes from './modules/payments/payments.routes';
import capacityRoutes from './modules/capacity/capacity.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import uploadRoutes from './modules/uploads/uploads.routes';
import invoiceRoutes from './modules/invoices/invoices.routes';
import serviceRoutes from './modules/services/services.routes';
import notificationRoutes from './modules/notifications/notifications.routes';

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
    },
  },
}));

// CORS — whitelist frontend only, with credentials
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) },
}));

// Rate limiting
app.use(generalRateLimit);

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/capacity', capacityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 & error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
