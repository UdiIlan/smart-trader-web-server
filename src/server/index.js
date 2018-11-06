import logger from 'logger';
import express from 'express';
import osprey from 'osprey';
const join = require('path').join;

import requestRouter from './routes/requests';
import getWebsocketWrapper from 'websocketWrapper';

class Server {

  start(params) {
    const websocketWrapper = getWebsocketWrapper();
    const PORT = process.env.PORT || params.serverPort;
    logger.info('starting server...');
    osprey.loadFile(join(__dirname, 'api.raml'))
      .then(function (middleware) {
        const app = express();

        app.use('/', middleware, requestRouter);

        app.listen(PORT, function () {
          console.log('Application listening on %d ...', PORT);
        });
      });
  }

  stop() {
    logger.info('server is going down...');
  }

}

const server = new Server();

export default server;