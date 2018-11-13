
import logger from 'logger';
import uuidv4 from 'uuid/v4';
import { orderTypes, orderTypesStr, Notifications } from 'smart-trader-common';


import EventQueue from 'eventQueue';
import getWebsocketWrapper from 'websocketWrapper';
import { NotificationsString }  from  'smart-trader-common';

class RequestExecuter {
  constructor(params) {

    this.defaultUserId = params.defaultUserId;
    this.webSocketWrapper = getWebsocketWrapper();
    this.accounts = {};
    this.balances = {};
    this.cachedTotalBalance = {};
    this.dirtyCache = false;

    this.eventQueue = new EventQueue({ endpoint : `${params.kafkaZookeeperUrl}:${params.kafkaZookeeperPort}`,
      topics: [params.balancesTopic, params.notificationsTopic],
      ordersTopic: params.ordersTopic,
      notificationsTopic: params.notificationsTopic },
    this.handleMessage.bind(this));

  }


  handleMessage(message) {
    if (message.topic === 'notifications') {
      this.webSocketWrapper.broadcast(NotificationsString[message.key] + '  ' + message.value);
      console.log('NOTIFICATION type - ' + NotificationsString[message.key] + ' value  = ' + message.value);
    }
    else if (message.topic === 'balances') {
      logger.info('BALANCE MESSAGE, key = %s, value =  %o',message.key, message.value);
      const incomingData = JSON.parse(message.value);
      Object.keys(incomingData).forEach((userId) => {

        if (!this.balances[userId]) {
          this.balances[userId] = {};
        }
        this.balances[userId][message.key] = incomingData[userId];
      });
      this.dirtyCache = true;
    }
    else {
      logger.error('unknown topic %s', message.topic);
    }
  }

  async getUserDataFromCache(userId) {

    if (this.dirtyCache) {
      await Object.keys(this.balances[userId]).forEach((exchange) => {
        Object.keys(this.balances[userId][exchange]).forEach((currency) => {
          if (this.cachedTotalBalance[currency]) {
            this.cachedTotalBalance[currency] += Number(this.balances[userId][exchange][currency]);
          }
          else{
            this.cachedTotalBalance[currency] =  Number(this.balances[userId][exchange][currency]);
          }
        });
        this.dirtyCache = false;
      });
    }
    return this.cachedTotalBalance;
  }

  createNewAccount(params) {
    if (this.accounts[params.name]) {
      throw new Error(`account ${params.name} already exist`);
    }
    this.accounts[params.name] = params.description;
    // this.accounts[name]['description'] = description;
  }

  updateAccount(params) {
    if (!this.accounts[params.name]) {
      throw new Error(`account ${params.name} doesn't exist`);
    }
    this.accounts[params.name] = params.description;
  }

  validateAccount(accountName) {
    if (!this.accounts[accountName]) {
      throw new Error(`account ${accountName} doesn't exist` );
    }
  }

  login(req, res) {
    const requestIdVal = uuidv4();
    const exchangeVal = req.body.exchange.toLowerCase();
    const keyVal = req.body.key;
    const secretVal = req.body.secret;
    const clientIdVal = req.body.clientId;

    logger.debug('about to send login to %s request for key =  %s, request id = %s', exchangeVal, keyVal, requestIdVal);
    this.eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
      {
        exchange: exchangeVal,
        requestId: requestIdVal
      });

    this.eventQueue.sendRequest(orderTypes.login,
      {
        exchange: exchangeVal,
        key: keyVal,
        secret: secretVal,
        clientId: clientIdVal,
        requestId: requestIdVal,
        userId: this.defaultUserId
      });
    logger.debug('login request for key = %s, request id = %s was sent',keyVal, requestIdVal);
    res.end('login request sent');
  }

  getUserData(req, res) {
    const requestIdVal = uuidv4();
    const exchangeVal = req.body.exchange.toLowerCase();

    logger.debug('about to send getUserData request to %s, request id = %s', exchangeVal, requestIdVal);
    this.eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
      {
        requestId: requestIdVal,
        exchange: exchangeVal,
      });

    this.eventQueue.sendRequest(
      orderTypes.getUserData,
      {
        exchange: exchangeVal,
        requestId: requestIdVal,
        userId: this.defaultUserId,
      });
    logger.debug('getUserData request for key = %s, request id = %s was sent', exchangeVal, requestIdVal);
    res.end('getUserData request sent');
  }



  sendOrder(req, res, orderType) {
    const requestIdVal = uuidv4();
    const exchangeVal = req.body.exchange.toLowerCase();

    logger.debug('about to send %s %s request to %s, request id = %s',orderTypesStr[orderType], req.body.actionType, exchangeVal, requestIdVal);
    this.eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
      {
        exchange: exchangeVal,
        requestId: requestIdVal,
      });

    this.eventQueue.sendRequest(orderType,
      {
        exchange: exchangeVal,
        requestId: requestIdVal,
        amount: req.body.amount,
        price: req.body.price,
        currencyPair: req.body.currencyPair,
        userId: (req.body.userId ? req.body.userId : req.defaultUserId) ,
        durationMinutes: req.body.durationMinutes,
        maxSizePerTransaction: req.body.maxOrderSize,
        actionType: req.body.actionType,
      });
    logger.debug('%s %s request to %s, request id = %s was sent',orderTypesStr[orderType], req.body.actionType, exchangeVal, requestIdVal);

    res.end(`${orderTypesStr[orderType]} ${req.body.actionType} request sent` );
  }
}




let webSocketWrapper = null;

const getInstance = (params) => {
  if (!webSocketWrapper) {
    webSocketWrapper = new RequestExecuter(params);
  }
  return webSocketWrapper;
};


module.exports = getInstance;