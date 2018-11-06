// import { returnMessages } from 'status';
import EventQueue from 'eventQueue';
import logger from 'logger';
import osprey from 'osprey';
import uuidv4 from 'uuid/v4';
import { orderTypes, Notifications } from 'smart-trader-common';
import nodeConfigModule from 'node-config-module';

const conf = nodeConfigModule.getConfig();
const eventQueue = new EventQueue(conf);

let router = osprey.Router();

router.post('/exchange/{exchange}/login', async (req, res, next) => {
  req.body['exchange'] = req.params.exchange;
  login(req, res, next);
});

// router.post('/login', async (req, res, next) => {
//   login(req, res, next);
// });


// router.post('/getUserData', async (req, res, next) => {
//   getUserData(req, res, next);
// });

router.get('/exchange/{exchange}/accountBalance', async (req, res, next) => {
  req.body = {};
  req.body['exchange'] = req.params.exchange;
  getUserData(req, res, next);
});


// router.post('/buyImmediateOrCancel', async (req, res, next) => {
//   buyImmediateOrCancel(req, res, next);
// });

// router.post('/sellImmediateOrCancel', async (req, res, next) => {
//   sellImmediateOrCancel(req, res, next);
// });

// router.post('/timedBuyTaking', async (req, res, next) => {
//   timedBuyTaking(req, res, next);
// });

// router.post('/timedSellTaking', async (req, res, next) => {
//   timedSellTaking(req, res, next);
// });

router.post('/sendOrder', async (req, res, next) => {
  req.body['exchange'] = req.body.exchanges[0];
  req.body['currencyPair'] = req.body.assetPair;
  req.body['amount'] = req.body.size;
  const action = req.body.actionType;
  switch(action) {

    case 'buy':
      if (req.body.price) {
        buyImmediateOrCancel(req,res,next);
      }
      else{
        buyMarket(req, res, next);
      }
      break;
    case 'sell':
      if (req.body.price) {
        sellImmediateOrCancel(req,res,next);
      }
      else{
        sellMarket(req, res, next);
      }
      break;
    case 'timedBuyTaking':
      timedBuyTaking(req, res, next);
      break;
    case 'timedSellTaking':
      timedSellTaking(req, res, next);
      break;
    case 'timedBuyMaking':
      timedBuyMaking(req, res, next);
      break;
    case 'timedSellMaking':
      timedSellMaking(req, res, next);
      break;

    default:
      logger.error('unknown actionType');
      return;
  }

});



// router.post('/timedBuyMaking', async (req, res, next) => {
//   timedBuyMaking(req, res, next);
// });

// router.post('/timedSellMaking', async (req, res, next) => {
//   timedSellMaking(req, res, next);
// });

function login(req, res, next) {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();
  const keyVal = req.body.key;
  const secretVal = req.body.secret;
  const clientIdVal = req.body.clientId;

  logger.debug('about to send login to %s request for key =  %s, request id = %s', exchangeVal, keyVal, requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    {
      exchange: exchangeVal,
      requestId: requestIdVal
    });

  eventQueue.sendRequest(orderTypes.login,
    {
      exchange: exchangeVal,
      key: keyVal,
      secret: secretVal,
      clientId: clientIdVal,
      requestId: requestIdVal,
      userId: conf.defaultUserId,
    });
  logger.debug('login request for key = %s, request id = %s was sent',keyVal, requestIdVal);
  res.status = 200;
  res.end('login request sent');
  next();
}

function getUserData(req, res, next) {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send getUserData request to %s, request id = %s', exchangeVal, requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    {
      requestId: requestIdVal,
      exchange: exchangeVal,
    });

  eventQueue.sendRequest(
    orderTypes.getUserData,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
      userId: conf.defaultUserId,
    });
  logger.debug('getUserData request for key = %s, request id = %s was sent', exchangeVal, requestIdVal);
  res.status = 200;
  res.end('getUserData request sent');
  next();
}

function buyImmediateOrCancel(req, res, next) {

  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send buyImmediateOrCancel request to %s, request id = %s', exchangeVal, requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    {
      requestId: requestIdVal,
      exchange: exchangeVal,
    });

  eventQueue.sendRequest(orderTypes.buyImmediateOrCancel,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
      amount: req.body.amount,
      price: req.body.price,
      currencyPair: req.body.currencyPair,
      userId: conf.defaultUserId,
    });
  logger.debug('buyImmediateOrCancel request to %s, request id = %s was sent', exchangeVal, requestIdVal);

  res.status = 200;
  res.end('buyImmediateOrCancel request sent');
  next();
}

function sellImmediateOrCancel(req, res, next) {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send sellImmediateOrCancel request to %s, request id = %s', exchangeVal, requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    {
      requestId: requestIdVal,
      exchange: exchangeVal,
    });
  eventQueue.sendRequest(orderTypes.sellImmediateOrCancel,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
      amount: req.body.amount,
      price: req.body.price,
      currencyPair: req.body.currencyPair,
      userId: conf.defaultUserId,
    });
  logger.debug('sellImmediateOrCancel request to %s, request id = %s was sent', exchangeVal, requestIdVal);

  res.status = 200;
  res.end('sellImmediateOrCancel request sent');
  next();
}

function buyMarket(req, res, next) {

}
function sellMarket(req, res, next) {
}

function timedBuyTaking(req, res, next) {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send timeBuyTaking request to %s, request id = %s'  , exchangeVal, requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
    });

  eventQueue.sendRequest(orderTypes.timeBuyTaking,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
      amount: req.body.amount,
      price: req.body.price,
      currencyPair: req.body.currencyPair,
      userId: conf.defaultUserId,
      periodMinute: req.body.duration,
      maxSizePerTransaction: req.body.maxOrderSize,
    });
  logger.debug('timeBuyTaking request to %s, request id = %s was sent', exchangeVal, requestIdVal);

  res.status = 200;
  res.end('timeBuyTaking request sent');
  next();
}

function timedSellTaking(req, res, next) {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send timeSellTaking request to %s, request id = $s', exchangeVal, requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    {
      requestId: requestIdVal,
      exchange: exchangeVal,
    });
  eventQueue.sendRequest(orderTypes.timeSellTaking,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
      amount: req.body.amount,
      price: req.body.price,
      currencyPair: req.body.currencyPair,
      userId: conf.defaultUserId,
      periodMinute: req.body.duration,
      maxSizePerTransaction: req.body.maxOrderSize,
    });
  logger.debug('timeSellTaking request to %s, request id = %s was sent',exchangeVal , requestIdVal);

  res.status = 200;
  res.end('timeSellTaking request sent');
  next();
}

function timedBuyMaking(req, res, next) {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send timedBuyMaking request to %s, request id = %s' , exchangeVal, requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    {
      requestId: requestIdVal,
      exchange: exchangeVal
    });
  eventQueue.sendRequest(orderTypes.timedBuyMaking,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
      amount: req.body.amount,
      price: req.body.price,
      currencyPair: req.body.currencyPair,
      userId: conf.defaultUserId,
      periodMinute: req.body.duration,
      maxSizePerTransaction: req.body.maxOrderSize,
    });
  logger.debug('timedBuyMaking request to %s, request id = %s was sent', exchangeVal, requestIdVal);

  res.status = 200;
  res.end('timedBuyMaking request sent');
  next();
}

function timedSellMaking(req, res, next) {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send timedSellMaking request to %s, request id = %s' , exchangeVal, requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    {
      requestId: requestIdVal,
      exchange: exchangeVal
    });

  eventQueue.sendRequest(orderTypes.timedSellMaking,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
      amount: req.body.amount,
      price: req.body.price,
      currencyPair: req.body.currencyPair,
      userId: conf.defaultUserId,
      periodMinute: req.body.duration,
      maxSizePerTransaction: req.body.maxOrderSize,
    });
  logger.debug('timedSellMaking request to %s, request id = %s was sent', exchangeVal, requestIdVal );

  res.status = 200;
  res.end('timedSellMaking request sent');
  next();
}

export default router;
