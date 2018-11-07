// import { returnMessages } from 'status';
import EventQueue from 'eventQueue';
import logger from 'logger';
import osprey from 'osprey';
import uuidv4 from 'uuid/v4';
import { orderTypes,orderTypesStr, Notifications } from 'smart-trader-common';
import nodeConfigModule from 'node-config-module';
import getWebsocketWrapper from 'websocketWrapper';
import { NotificationsString }  from  'smart-trader-common';

const conf = nodeConfigModule.getConfig();
const webSocketWrapper = getWebsocketWrapper();

function handleMessage(message) {
  if (message.topic === 'notifications') {
    webSocketWrapper.broadcast(NotificationsString[message.key] + '  ' + message.value);
    console.log('NOTIFICATION type - ' + NotificationsString[message.key] + ' value  = ' + message.value);
  }
  else if (message.topic === 'balances') {
    logger.info('BALANCE MESSAGE ---> %s', message.value);
  }
  else {
    logger.error('unknown topic %s', message.topic);
  }
}

// const eventQueue = new EventQueue(conf);
const eventQueue = new EventQueue({ endpoint : `${conf.kafkaZookeeperUrl}:${conf.kafkaZookeeperPort}`,
  topics: [conf.balancesTopic, conf.notificationsTopic],
  ordersTopic: conf.ordersTopic,
  notificationsTopic: conf.notificationsTopic },
handleMessage
);

let router = osprey.Router();

router.post('/exchange/{exchange}/login', async (req, res, next) => {
  try{
    req.body['exchange'] = req.params.exchange;
    login(req, res, next);
  }
  catch(err) {
    next(err);
  }

});

router.get('/exchange/{exchange}/accountBalance', async (req, res, next) => {
  try{
    req.body = {};
    req.body['exchange'] = req.params.exchange;
    getUserData(req, res, next);
  }
  catch(err) {
    next(err);
  }
});

router.post('/sendOrder', async (req, res, next) => {
  try{
    req.body['exchange'] = req.body.exchanges[0];
    req.body['currencyPair'] = req.body.assetPair;
    req.body['amount'] = req.body.size;
    const action = req.body.actionType;

    if (action == 'buy_making' || action == 'sell_making') {
      req.body.actionType = action.split('_')[0];
      sendOrder(req, res, orderTypes.timedMaking);
    }
    else if (req.body.price) {
      if (req.body.durationMinutes && Number(req.body.durationMinutes)) {
        sendOrder(req, res, orderTypes.timedTaking);
      }
      else{
        sendOrder(req, res, orderTypes.ImmediateOrCancel);
      }
    }
    else {
      sendOrder(req, res, orderTypes.market);
    }
  }
  catch(err) {
    next(err);
  }

});

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
  res.end('login request sent');
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
  res.end('getUserData request sent');
}



function sendOrder(req, res, orderType) {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send %s %s request to %s, request id = %s',orderTypesStr[orderType], req.body.actionType, exchangeVal, requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
    });

  eventQueue.sendRequest(orderType,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
      amount: req.body.amount,
      price: req.body.price,
      currencyPair: req.body.currencyPair,
      userId: conf.defaultUserId,
      durationMinutes: req.body.durationMinutes,
      maxSizePerTransaction: req.body.maxOrderSize,
      actionType: req.body.actionType,
    });
  logger.debug('%s %s request to %s, request id = %s was sent',orderTypesStr[orderType], req.body.actionType, exchangeVal, requestIdVal);

  res.end(`${orderTypesStr[orderType]} ${req.body.actionType} request sent` );
}

export default router;
