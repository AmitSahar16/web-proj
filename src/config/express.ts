import { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from '../routes';
import { configSwagger } from './swagger';

export const configExpress = (app: Express, port: number) => {
  app.use(cors());

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use('/', routes);

  configSwagger(app, port);
};