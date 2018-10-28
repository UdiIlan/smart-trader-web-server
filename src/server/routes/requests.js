// import Handler from 'handlerDelegator';
// import { returnMessages } from 'status';
import EventQueue from 'eventQueue';
import logger from 'logger';
import osprey from 'osprey';
import uuidv4 from 'uuid/v4';
import { orderTypes, orderTypesStr } from './orderTypes';
import { Notifications } from 'notifications';


const DEFAULT_USER_ID = 'defaultUserId';

const eventQueue = new EventQueue();


// const handler = new Handler();
let router = osprey.Router();

router.post('/login', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();
  const keyVal = req.body.key;
  const secretVal = req.body.secret;
  const clientIdVal = req.body.clientId;

  logger.debug('about to send login to ' + exchangeVal + ' request for key = ' + keyVal + ', request id = ' + requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    { exchange: exchangeVal,
      requestId: requestIdVal
    });

  eventQueue.sendRequest(orderTypes.login,
    { exchange: exchangeVal,
      key: keyVal,
      secret: secretVal,
      clientId: clientIdVal,
      requestId: requestIdVal,
      userId : DEFAULT_USER_ID,
    });
  logger.debug('login request for key = ' + keyVal + ', request id = ' + requestIdVal + ' was sent');
  res.status = 200;
  res.end('login request sent');
  next();
});


router.post('/getUserData', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send getUserData request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    { requestId: requestIdVal ,
      exchange : exchangeVal,
    });

  eventQueue.sendRequest(
    orderTypes.getUserData,
    { exchange: exchangeVal,
      requestId: requestIdVal,
      userId : 'defaultUserId',
    });
  logger.debug('getUserData request for key = ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');
  res.status = 200;
  res.end('getUserData request sent');
  next();
});


router.post('/buyImmediateOrCancel', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send buyImmediateOrCancel request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    { requestId: requestIdVal,
      exchange: exchangeVal,
    });

  eventQueue.sendRequest(orderTypes.buyImmediateOrCancel,
    { exchange: exchangeVal,
      requestId: requestIdVal,
      amount: req.body.amount,
      price:  req.body.price,
      currencyPair: req.body.currencyPair,
      userId : 'defaultUserId',
    });
  logger.debug('buyImmediateOrCancel request to ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');

  res.status = 200;
  res.end('buyImmediateOrCancel request sent');
  next();

});

router.post('/sellImmediateOrCancel', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send sellImmediateOrCancel request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    { requestId: requestIdVal,
      exchange: exchangeVal,
    });
  eventQueue.sendRequest(orderTypes.sellImmediateOrCancel,
    { exchange: exchangeVal,
      requestId: requestIdVal,
      amount: req.body.amount,
      price:  req.body.price,
      currencyPair: req.body.currencyPair,
      userId : 'defaultUserId',
    });
  logger.debug('sellImmediateOrCancel request to ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');

  res.status = 200;
  res.end('sellImmediateOrCancel request sent');
  next();

});

router.post('/timeBuyTaking', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send timeBuyTaking request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    {
      exchange: exchangeVal,
      requestId: requestIdVal ,
    });

  eventQueue.sendRequest(orderTypes.timeBuyTaking,
    { exchange: exchangeVal,
      requestId: requestIdVal,
      amount: req.body.amount,
      price:  req.body.price,
      currencyPair: req.body.currencyPair,
      userId : 'defaultUserId',
      periodMinute: req.body.duration,
      maxSizePerTransaction : req.body.maxOrderSize,
    });
  logger.debug('timeBuyTaking request to ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');

  res.status = 200;
  res.end('timeBuyTaking request sent');
  next();
});

router.post('/timeSellTaking', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send timeSellTaking request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    {
      requestId: requestIdVal ,
      exchange: exchangeVal,
    });
  eventQueue.sendRequest(orderTypes.timeSellTaking,
    { exchange: exchangeVal,
      requestId: requestIdVal,
      amount: req.body.amount,
      price:  req.body.price,
      currencyPair: req.body.currencyPair,
      userId : 'defaultUserId',
      periodMinute: req.body.duration,
      maxSizePerTransaction : req.body.maxOrderSize,
    });
  logger.debug('timeSellTaking request to ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');

  res.status = 200;
  res.end('timeSellTaking request sent');
  next();
});

router.post('/timedBuyMaking', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send timedBuyMaking request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    { requestId: requestIdVal ,
      exchange: exchangeVal
    });
  eventQueue.sendRequest(orderTypes.timedBuyMaking,
    { exchange: exchangeVal,
      requestId: requestIdVal,
      amount: req.body.amount,
      price:  req.body.price,
      currencyPair: req.body.currencyPair,
      userId : 'defaultUserId',
      periodMinute: req.body.duration,
      maxSizePerTransaction : req.body.maxOrderSize,
    });
  logger.debug('timedBuyMaking request to ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');

  res.status = 200;
  res.end('timedBuyMaking request sent');
  next();
});

router.post('/timedSellMaking', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send timedSellMaking request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    { requestId: requestIdVal ,
      exchange: exchangeVal });

  eventQueue.sendRequest(orderTypes.timedSellMaking,
    { exchange: exchangeVal,
      requestId: requestIdVal,
      amount: req.body.amount,
      price:  req.body.price,
      currencyPair: req.body.currencyPair,
      userId : 'defaultUserId',
      periodMinute: req.body.duration,
      maxSizePerTransaction : req.body.maxOrderSize,
    });
  logger.debug('timedSellMaking request to ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');

  res.status = 200;
  res.end('timedSellMaking request sent');
  next();
});

export default router;
