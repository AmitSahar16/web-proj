import express from 'express';
import { configExpress } from './config/express';
import { configMongo } from './config/mongo';

const startServer = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    const app = express();

    configExpress(app, port);

    await configMongo();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
