import logger from 'logger';
import express from 'express';
import osprey from 'osprey';
const join = require('path').join;

import requestRouter from './routes/requests';
import createError from 'http-errors';
import getWebsocketWrapper from 'websocketWrapper';

class Server {

  start(params) {
    const PORT = process.env.PORT || params.serverPort;
    logger.info('starting server...');
    osprey.loadFile(join(__dirname, 'api.raml'))
      .then(function (middleware) {
        const app = express();

        app.use('/', middleware, requestRouter);


        // catch 404 and forward to error handler
        app.use(function(req, res, next) {
          next(createError(404));
        });

        // error handler
        app.use(function(err, req, res, next) {
        // set locals, only providing error in development
            
          logger.error('error occurred: %o', err.message);
          res.locals.message = err.message;
          res.locals.error = app.get('env') === 'development' ? err : {};

          // render the error page
          res.status(err.status || 500);
          res.end(err.message);
        });


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