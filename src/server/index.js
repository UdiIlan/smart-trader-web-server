import logger from 'logger';
import express from 'express';
import osprey from 'osprey';
const join = require('path').join;

import requestRouter from './routes/requests';
import accountRouter from './routes/accounts';
import createError from 'http-errors';
import getRequestsExecuter from './modules/requestsExecuter';

class Server {

  start(params) {
    getRequestsExecuter(params);
    const PORT = process.env.PORT || params.serverPort;
    logger.info('starting server...');
    try{
      osprey.loadFile(join(__dirname + '/routes/raml/', 'api.raml'))
        .then(function (middleware) {
          const app = express();

          app.use('/', middleware, requestRouter);
          app.use('/', middleware, accountRouter);


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
        }).catch(err => logger.error('%o', err ));
    }
    catch(err) {
      console.log('ERROR = ' + err);
    }
  }

  stop() {
    logger.info('server is going down...');
  }

}

const server = new Server();

export default server;