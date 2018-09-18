// import Handler from 'handlerDeligator';
// import { returnMessages } from 'status';
import logger from 'logger';
import osprey from 'osprey';
import uuidv4 from 'uuid/v4';
import EventQueue from 'eventQueue';
import orderTypes from './orderTypes';

let eventQueue = new EventQueue();


// const handler = new Handler();
let router = osprey.Router();

router.post('/login', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();
  const keyVal = req.body.key;
  const secretVal = req.body.secret;
  const clientIdVal = req.body.clientId;

  logger.debug('about to send login to ' + exchangeVal + ' request for key = ' + keyVal + ', request id = ' + requestIdVal);
  eventQueue.sendRequest(orderTypes.login, { exchange: exchangeVal, key: keyVal, secret: secretVal, clientId: clientIdVal, requestId: requestIdVal });
  logger.debug('login request for key = ' + keyVal + ', request id = ' + requestIdVal + ' was sent');
  next();
});


router.post('/getUserData', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();

  logger.debug('about to send getUserData request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendRequest(orderTypes.getUserData, { exchange: exchangeVal, requestId: requestIdVal });
  logger.debug('getUserData request for key = ' + keyVal + ', request id = ' + requestIdVal + ' was sent');
});


router.post('/buyImmediateOrCancel', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();
  const amountVal = req.body.amount;
  const priceVal = req.body.price;
  const currencyPairVal = req.body.currencyPair;

  logger.debug('about to send buyImmediateOrCancel request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendRequest(orderTypes.buyImmediateOrCancel,
    { exchange: exchangeVal, requestId: requestIdVal, amount: amountVal, price: priceVal, currencyPair: currencyPairVal });
  logger.debug('buyImmediateOrCancel request to ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');

});

router.post('/sellImmediateOrCancel', async (req, res, next) => {
  const requestIdVal = uuidv4();
  const exchangeVal = req.body.exchange.toLowerCase();
  const amountVal = req.body.amount;
  const priceVal = req.body.price;
  const currencyPairVal = req.body.currencyPair;

  logger.debug('about to send sellImmediateOrCancel request to ' + exchangeVal + ', request id = ' + requestIdVal);
  eventQueue.sendRequest(orderTypes.sellImmediateOrCancel,
    {
      exchange: exchangeVal,
      requestId: requestIdVal,
      amount: amountVal,
      price: priceVal,
      currencyPair: currencyPairVal
    });
  logger.debug('sellImmediateOrCancel request to ' + exchangeVal + ', request id = ' + requestIdVal + ' was sent');
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
});

// getUserData: 0,
// buyImmediateOrCancel: 1,
// sellImmediateOrCancel: 2,
// login: 3,
// timeBuyTaking: 4,
// timeSellTaking: 5,
// timedBuyMaking: 6,
// timedSellMaking: 7
export default router;
