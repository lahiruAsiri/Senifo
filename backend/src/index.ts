import 'dotenv/config';
import { env } from './config/env';
import { prisma } from './config/database';
import { ensureBucketsExist } from './config/minio';
import { logger } from './utils/logger';
import app from './app';

async function main() {
  try {
    // Validate env (already done by importing env.ts)
    logger.info('✅ Environment variables validated');

    // Connect to database
    await prisma.$connect();
    logger.info('✅ Connected to PostgreSQL');

    // Ensure MinIO buckets exist
    await ensureBucketsExist();
    logger.info('✅ MinIO buckets ready');

    // Start server
    app.listen(env.PORT, () => {
      logger.info(`🚀 SENIFO Backend running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
