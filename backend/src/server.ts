import app from './app';
import { config } from './config';
import prisma from './config/database';
import logger from './utils/logger';

const PORT = config.port;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);

      // Also log with Winston
      logger.info('Server started successfully', {
        port: PORT,
        environment: config.nodeEnv,
        apiUrl: `http://localhost:${PORT}/api`,
      });
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to start server:', errorMessage);
    logger.error('Failed to start server', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  logger.info('SIGINT received - shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  logger.info('SIGTERM received - shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
