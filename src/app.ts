import express from 'express';
import { configExpress } from './config/express';
import { configMongo } from './config/mongo';

const app = express();
const port = Number(process.env.PORT) || 3000;

async function startServer() {
  configExpress(app, port);

  await configMongo();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;

