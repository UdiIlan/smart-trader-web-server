
import logger from 'logger';
import uuidv4 from 'uuid/v4';
import { orderTypes, orderTypesStr, Notifications, queryTypes, NotificationsString } from 'smart-trader-common';


import EventQueue from 'eventQueue';
import getWebsocketWrapper from 'websocketWrapper';
import CondVar from 'condition-variable';

class RequestExecuter {
  constructor(params) {

    this.defaultUserId = params.defaultUserId;
    this.webSocketWrapper = getWebsocketWrapper();
    this.accounts = {};
    this.balances = {};
    this.cachedTotalBalance = {};
    this.dirtyCache = false;
    this.conditionVariables = {};
    this.defaultExchanges = params.defaultExchanges;
    this.queryAnswers = {};

    this.eventQueue = new EventQueue({
      endpoint: `${params.kafkaZookeeperUrl}:${params.kafkaZookeeperPort}`,
      topics: [params.balancesTopic, params.notificationsTopic, params.queryAnsTopic],
      ordersTopic: params.ordersTopic,
      queryTopic : params.queryTopic,
      notificationsTopic: params.notificationsTopic
    },
    this.handleMessage.bind(this));

  }


  handleMessage(message) {
    if (message.topic === 'notifications') {
      this.webSocketWrapper.broadcast(NotificationsString[message.key] + '  ' + message.value);
      logger.debug(`NOTIFICATION type - ${NotificationsString[message.key]}  value  = ${message.value}`);
    }
    else if (message.topic === 'balances') {
      logger.info('BALANCE MESSAGE, key = %s, value =  %o', message.key, message.value);
      const accountName = message.key;
      const incomingData = JSON.parse(message.value);
      Object.keys(incomingData).forEach((exchange) => {

        if (!this.balances[accountName]) {
          this.balances[accountName] = {};
        }
        if (!this.balances[accountName][exchange]) {
          this.balances[accountName][exchange] = {};
        }

        Object.keys(incomingData[exchange]).forEach((asset) => {
          if (!this.balances[accountName][exchange][asset]) {
            this.balances[accountName][exchange][asset] = {};
          }
          this.balances[accountName][exchange][asset]['confirmed'] = incomingData[exchange][asset];
        });
      });
      this.dirtyCache = true;
    }
    else if (message.topic === 'queryAns') {
      const data = JSON.parse(message.value);
      if (this.conditionVariables[data.requestId]) {
        this.conditionVariables[data.requestId].complete(data);
      }
      else{
        logger.error('request id = %o was not found', data.requestId);
      }
    }
    else {
      logger.error('unknown topic %s', message.topic);
    }
  }

  async getUserDataFromCache(account) {

    // if (this.dirtyCache) {
    //   await Object.keys(this.balances[userId]).forEach((exchange) => {
    //     Object.keys(this.balances[userId][exchange]).forEach((currency) => {
    //       if (this.cachedTotalBalance[currency]) {
    //         this.cachedTotalBalance[currency] += Number(this.balances[userId][exchange][currency]);
    //       }
    //       else{
    //         this.cachedTotalBalance[currency] =  Number(this.balances[userId][exchange][currency]);
    //       }
    //     });
    //     this.dirtyCache = false;
    //   });
    // }
    // return this.cachedTotalBalance;
    return this.balances[account]['Unified'];
  }

  getAccounts() {
    return this.accounts;
  }

  createNewAccount(params) {
    if (this.accounts[params.name]) {
      throw new Error(`account ${params.name} already exist`);
    }
    this.accounts[params.name] = {
      name: params.name,
      description: params.description
    };
    // this.accounts[name]['description'] = description;
  }

  updateAccount(params) {
    if (!this.accounts[params.name]) {
      throw new Error(`account ${params.name} doesn't exist`);
    }
    this.accounts[params.name].description = params.description;
  }

  deleteAccount(accountName) {
    if (!this.accounts[accountName]) {
      throw new Error(`account ${accountName} doesn't exist`);
    }
    else {
      delete this.accounts[accountName];
    }
  }

  validateAccount(accountName) {
    if (!this.accounts[accountName]) {
      throw new Error(`account ${accountName} doesn't exist`);
    }
  }

  login(req, res) {
    const requestIdVal = uuidv4();
    const exchangeVal = req.body.exchange.toLowerCase();
    const keyVal = req.body.key;
    const secretVal = req.body.secret;
    const account = req.body.account;

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
        account: account,
        requestId: requestIdVal,
        userId: this.defaultUserId
      });
    logger.debug('login request for key = %s, request id = %s was sent', keyVal, requestIdVal);
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
        account: this.defaultUserId,
      });
    logger.debug('getUserData request for key = %s, request id = %s was sent', exchangeVal, requestIdVal);
    res.end('getUserData request sent');
  }



  sendOrder(req, res, orderType) {
    const requestIdVal = uuidv4();
    const exchanges = req.body.exchanges ? req.body.exchanges : this.defaultExchanges;

    logger.debug('about to send %s %s request to %s, request id = %s', orderTypesStr[orderType], req.body.actionType, exchanges.join(), requestIdVal);
    this.eventQueue.sendNotification(Notifications.AboutToSendToEventQueue,
      {
        exchanges: exchanges,
        requestId: requestIdVal,
      });



    this.eventQueue.sendRequest(orderType,
      {
        exchanges: exchanges,
        requestId: requestIdVal,
        size: req.body.size,
        price: req.body.price,
        currencyPair: req.body.currencyPair,
        account: (req.body.account ? req.body.account : req.defaultUserId),
        durationMinutes: req.body.durationMinutes,
        maxOrderSize: req.body.maxOrderSize,
        actionType: req.body.actionType,
      });

    // condVar.wait(30000,(err, result) => {
    //   if (err) {
    //     logger.error('FAILED: err=%s', err);
    //   }
    //   else {
    //     logger.debug('%s %s request to %s, request id = %s was sent',orderTypesStr[orderType], req.body.actionType, exchanges.join(), requestIdVal);
    //     res.end(`${orderTypesStr[orderType]} ${req.body.actionType} request sent` );
    //   }
    // });


  }

  registerOrder(message) {
    this.eventQueue.sendToDB(message);
  }

  // condVar.complete.bind(condVar);
  // ///////////////////////////////////////////

  getReport(req, res, queryType) {

    for (let i = 0; i < req.rawHeaders.length; ++i) {
      if (req.rawHeaders[i] === 'userid') {
        req.body['userId'] = req.rawHeaders[i + 1];
        break;
      }
    }
    req.body.requestId = uuidv4();
    this.eventQueue.sendQuery(queryType, req.body);

    // ////////////////////////////////////
    this.conditionVariables[req.body.requestId] = new CondVar();

    this.conditionVariables[req.body.requestId].wait(100000, (err, result) => {
      if (err) {
        logger.error('FAILED: err=%s', err);
        res.error(err);
      }
      else {
        res.json(result.data);
        res.end();
      }
    });
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