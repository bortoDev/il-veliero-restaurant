import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/environment';
import { seedIfEmpty } from './seed/seed';

async function bootstrap() {
  try {
    // 1. Connect to Database (External or In-Memory fallback)
    await connectDatabase();

    // Auto-seed if database is empty and enabled
    if (env.autoSeedIfEmpty && env.nodeEnv !== 'test') {
      await seedIfEmpty();
    }

    // 2. Instantiate Express App
    const app = createApp();

    // 3. Start HTTP Server
    const server = app.listen(env.port, () => {
      console.log(`⚓ Il Veliero Backend is sailing on port ${env.port} [${env.nodeEnv}]`);
      console.log(`   Health check: http://localhost:${env.port}/api/v1/health`);
      console.log(`   Uploads: http://localhost:${env.port}/uploads`);
    });

    // 4. Graceful Shutdown Handlers
    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Server] Fatal bootstrap error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  bootstrap();
}

export { bootstrap };
