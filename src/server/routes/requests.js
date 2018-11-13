// import { returnMessages } from 'status';


import osprey from 'osprey';
import getRequestsExecuter from 'requestsExecuter';

import { orderTypes, orderTypesStr, Notifications } from 'smart-trader-common';


let router = osprey.Router();
// /////////////////////////////////////////////
// router.post('/exchange/{exchange}/login', async (req, res, next) => {
//   try{
//     req.body['exchange'] = req.params.exchange;
//     getRequestsExecuter().login(req, res, next);
//   }
//   catch(err) {
//     next(err);
//   }
// }); // // this is a temporary API;

router.post('/accounts' , async (req, res, next) => {
  try{
    const params = { name: req.body.name, description: req.body.description };
    const requestsExecuter = getRequestsExecuter();
    requestsExecuter.createNewAccount(params);
    res.json(params);
  }
  catch(err) {
    next(err);
  }
});

router.put('/accounts/{accountName}' , async (req, res, next) => {
  try{
    const params = { name: req.params.accountName, description: req.body.description };
    const requestsExecuter = getRequestsExecuter();
    requestsExecuter.updateAccount(params);
    const json =  await requestsExecuter.getUserDataFromCache(req.params.accountName); // needs to be tested
    res.json(json);
  }
  catch(err) {
    next(err);
  }
});

router.get('/accounts/{accountName}/balance' , async (req, res, next) => {
  try{
    const requestsExecuter = getRequestsExecuter();
    requestsExecuter.validateAccount(req.params.accountName);
    const json =  await requestsExecuter.getUserDataFromCache(req.params.accountName);
    res.json(json);
  }
  catch(err) {
    next(err);
  }

});


router.get('/accounts/{accountName}/funds/withdrawals' , async (req, res, next) => {

  try{
    const requestsExecuter = getRequestsExecuter();
    requestsExecuter.validateAccount(req.params.accountName);
    // const json =  await requestsExecuter.getUserDataFromCache();
    // res.json(json);
  }
  catch(err) {
    next(err);
  }

});// should be implemented

router.post('/accounts/{accountName}/funds/withdrawals' , async (req, res, next) => {

  try{
    const requestsExecuter = getRequestsExecuter();
    requestsExecuter.validateAccount(req.params.accountName);
    // const json =  await requestsExecuter.getUserDataFromCache();
    // res.json(json);
  }
  catch(err) {
    next(err);
  }
});// should be implemented

router.get('/accounts/{accountName}/funds/withdrawals/{transactionId} ' , async (req, res, next) => {

  try{
    const requestsExecuter = getRequestsExecuter();
    requestsExecuter.validateAccount(req.params.accountName);
    // const json =  await requestsExecuter.getUserDataFromCache();
    // res.json(json);
  }
  catch(err) {
    next(err);
  }

});// should be implemented.

router.post('/accounts/{accountName}/trades' , async (req, res, next) => {
  try{
    const requestsExecuter = getRequestsExecuter();
    requestsExecuter.validateAccount(req.params.accountName);
    req.body['userId'] = req.params.accountName;
    req.body['exchange'] = 'bitstamp';
    req.body['amount'] = req.body.size; // temp
    req.body['currencyPair'] = req.body.assetPair;
    const action = req.body.actionType;



    if (action == 'buy' || action == 'sell') {
      if (req.body.price) {
        getRequestsExecuter().sendOrder(req, res, orderTypes.timedMaking);
      }
      else{
        getRequestsExecuter().sendOrder(req, res, orderTypes.timedMaking);
      }
    }
    else
    {
      throw new Error(`unknown action type ${action}`);
    }
  }
  catch(err) {
    next(err);
  }
});


router.get('/accounts/{accountName}/trades' , async (req, res, next) => {
  try{
    const requestsExecuter = getRequestsExecuter();
    requestsExecuter.validateAccount(req.params.accountName);
    res.end('success');
  }
  catch(err) {
    next(err);
  }
});

router.post('/reports/listTrades' , async (req, res, next) => {
  try{
    res.end('success');
  }
  catch(err) {
    next(err);
  }
});

router.post('/reports/listWithdrawals' , async (req, res, next) => {
  try{
    res.end('success');
  }
  catch(err) {
    next(err);
  }
});

router.post('/reports/listOrders' , async (req, res, next) => {
  try{
    res.end('success');
  }
  catch(err) {
    next(err);
  }
});

// ////////////////////////////////////////////////


router.get('/exchange/{exchange}/accountBalance', async (req, res, next) => {
  try{
    req.body = {};
    req.body['exchange'] = req.params.exchange;
    getRequestsExecuter().getUserData(req, res, next);
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
      getRequestsExecuter().sendOrder(req, res, orderTypes.timedMaking);
    }
    else if (req.body.price) {
      if (req.body.durationMinutes && Number(req.body.durationMinutes)) {
        getRequestsExecuter().sendOrder(req, res, orderTypes.timedTaking);
      }
      else{
        getRequestsExecuter().sendOrder(req, res, orderTypes.ImmediateOrCancel);
      }
    }
    else {
      getRequestsExecuter().sendOrder(req, res, orderTypes.market);
    }
  }
  catch(err) {
    next(err);
  }

});


export default router;
