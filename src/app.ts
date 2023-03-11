import express from 'express';
import { logsRoutes } from './routes';

class App {
  public server;

  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
  }

  routes() {
    this.server.use('/api/v0/logs', logsRoutes);
  }
}

export default new App().server;