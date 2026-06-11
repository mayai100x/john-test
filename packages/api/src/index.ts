import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { itemsRouter } from './routes/items';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/logger';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // Routes
  app.use('/health', healthRouter);
  app.use('/api/items', itemsRouter);

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}

// Only start listening when run directly (not in tests)
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}
