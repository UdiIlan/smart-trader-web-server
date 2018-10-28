import logger from 'logger';
import express from 'express';
import osprey from 'osprey';
const join = require('path').join;

import requestRouter from './routes/requests';

const PORT = process.env.PORT || 3001;

class Server {
  constructor() {
  }

  start() {
    logger.info('starting server...');
    osprey.loadFile(join(__dirname, 'api.raml'))
      .then(function (middleware) {
        const app = express();

        app.use('/', middleware, requestRouter);

        app.listen(PORT, function () {
          console.log('Application listening on ' + PORT + '...');
        });
      });
  }

  stop() {
    logger.info('server is going down...');
  }

}

const server = new Server();

export default server;