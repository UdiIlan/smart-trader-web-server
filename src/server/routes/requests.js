// import Handler from 'handlerDelegator';
// import { returnMessages } from 'status';
import EventQueue from 'eventQueue';
import logger from 'logger';
import osprey from 'osprey';
import uuidv4 from 'uuid/v4';
import { orderTypes, orderTypesStr } from './orderTypes';
import { Notifications } from '../../utils/notifications';

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
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue, { requestId: requestIdVal , orderType: orderTypes.login , orderTypeString : orderTypesStr[orderTypes.login] });
  eventQueue.sendRequest(orderTypes.login, { exchange: exchangeVal, key: keyVal, secret: secretVal, clientId: clientIdVal, requestId: requestIdVal });
  logger.debug('login request for key = ' + keyVal + ', request id = ' + requestIdVal + ' was sent');
  res.status = 200;
  res.end('login request sent');
  next();
});


router.post('/getUserData', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send getUserData request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue, { requestId: requestIdVal , orderType: orderTypes.getUserData , orderTypeString : orderTypesStr[orderTypes.getUserData] });
  eventQueue.sendRequest(orderTypes.getUserData, { exchange: exchangeVal, requestId: requestIdVal });
  logger.debug('getUserData request for key = ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');
  res.status = 200;
  res.end('getUserData request sent');
  next();
});


router.post('/buyImmediateOrCancel', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();
  const amountVal = req.body.amount;
  const priceVal = req.body.price;
  const currencyPairVal = req.body.currencyPair;

  logger.debug('about to send buyImmediateOrCancel request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue, { requestId: requestIdVal , orderType: orderTypes.buyImmediateOrCancel , orderTypeString : orderTypesStr[orderTypes.buyImmediateOrCancel] });
  eventQueue.sendRequest(orderTypes.buyImmediateOrCancel,
    { exchange: exchangeVal, requestId: requestIdVal, amount: amountVal, price: priceVal, currencyPair: currencyPairVal });
  logger.debug('buyImmediateOrCancel request to ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');

  res.status = 200;
  res.end('buyImmediateOrCancel request sent');
  next();

});

router.post('/sellImmediateOrCancel', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();
  const amountVal = req.body.amount;
  const priceVal = req.body.price;
  const currencyPairVal = req.body.currencyPair;

  logger.debug('about to send sellImmediateOrCancel request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue, { requestId: requestIdVal , orderType: orderTypes.sellImmediateOrCancel , orderTypeString : orderTypesStr[orderTypes.sellImmediateOrCancel] });
  eventQueue.sendRequest(orderTypes.sellImmediateOrCancel,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
      amount: amountVal,
      price: priceVal,
      currencyPair: currencyPairVal
    });
  logger.debug('sellImmediateOrCancel request to ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');

  res.status = 200;
  res.end('sellImmediateOrCancel request sent');
  next();

});

router.post('/timeBuyTaking', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();
  const amountVal = req.body.amount;
  const priceVal = req.body.price;
  const currencyPairVal = req.body.currencyPair;
  const durationVal = req.body.duration;
  const maxOrderSizeVal = req.body.maxOrderSize;

  logger.debug('about to send timeBuyTaking request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue, { requestId: requestIdVal , orderType: orderTypes.timeBuyTaking , orderTypeString : orderTypesStr[orderTypes.timeBuyTaking] });
  eventQueue.sendRequest(orderTypes.timeBuyTaking,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
      amount: amountVal,
      price: priceVal,
      currencyPair: currencyPairVal,
      duration: durationVal,
      maxOrderSize: maxOrderSizeVal
    });
  logger.debug('timeBuyTaking request to ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');

  res.status = 200;
  res.end('timeBuyTaking request sent');
  next();
});

router.post('/timeSellTaking', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();
  const amountVal = req.body.amount;
  const priceVal = req.body.price;
  const currencyPairVal = req.body.currencyPair;
  const durationVal = req.body.duration;
  const maxOrderSizeVal = req.body.maxOrderSize;

  logger.debug('about to send timeSellTaking request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue, { requestId: requestIdVal , orderType: orderTypes.timeSellTaking , orderTypeString : orderTypesStr[orderTypes.timeSellTaking] });
  eventQueue.sendRequest(orderTypes.timeSellTaking,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
      amount: amountVal,
      price: priceVal,
      currencyPair: currencyPairVal,
      duration: durationVal,
      maxOrderSize: maxOrderSizeVal
    });
  logger.debug('timeSellTaking request to ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');

  res.status = 200;
  res.end('timeSellTaking request sent');
  next();
});

router.post('/timedBuyMaking', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();
  const amountVal = req.body.amount;
  const priceVal = req.body.price;
  const currencyPairVal = req.body.currencyPair;
  const durationVal = req.body.duration;
  const maxOrderSizeVal = req.body.maxOrderSize;

  logger.debug('about to send timedBuyMaking request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue, { requestId: requestIdVal , orderType: orderTypes.timedBuyMaking , orderTypeString : orderTypesStr[orderTypes.timedBuyMaking] });
  eventQueue.sendRequest(orderTypes.timedBuyMaking,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
      amount: amountVal,
      price: priceVal,
      currencyPair: currencyPairVal,
      duration: durationVal,
      maxOrderSize: maxOrderSizeVal
    });
  logger.debug('timedBuyMaking request to ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');

  res.status = 200;
  res.end('timedBuyMaking request sent');
  next();
});

router.post('/timedSellMaking', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();
  const amountVal = req.body.amount;
  const priceVal = req.body.price;
  const currencyPairVal = req.body.currencyPair;
  const durationVal = req.body.duration;
  const maxOrderSizeVal = req.body.maxOrderSize;

  logger.debug('about to send timedSellMaking request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendNotification(Notifications.AboutToSendToEventQueue, { requestId: requestIdVal , orderType: orderTypes.timedSellMaking , orderTypeString : orderTypesStr[orderTypes.timedSellMaking] });

  eventQueue.sendRequest(orderTypes.timedSellMaking,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
      amount: amountVal,
      price: priceVal,
      currencyPair: currencyPairVal,
      duration: durationVal,
      maxOrderSize: maxOrderSizeVal
    });
  logger.debug('timedSellMaking request to ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');

  res.status = 200;
  res.end('timedSellMaking request sent');
  next();
});

export default router;
