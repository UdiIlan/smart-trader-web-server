import logger from 'logger';
import express from 'express';
import osprey from 'osprey';
let join = require('path').join;

import requestRouter from './routes/requests';

let PORT = process.env.PORT || 3001;

class Server {
  constructor() {
  }

  start() {
    logger.info('starting server...');
    osprey.loadFile(join(__dirname, 'api.raml'))
      .then(function (middleware) {
        let app = express();

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