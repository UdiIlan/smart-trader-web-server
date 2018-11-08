// import { returnMessages } from 'status';


import osprey from 'osprey';
import getRequestsExecuter from 'requestsExecuter';

import { orderTypes, orderTypesStr, Notifications } from 'smart-trader-common';


let router = osprey.Router();
///////////////////////////////////////////////

router.get('/accounts/{accountName}/balance' , async (req, res, next) => {
  try{
    const requestsExecuter = getRequestsExecuter();
    const json =  await requestsExecuter.getUserDataFromCache();
    res.json(json);
  }
  catch(err) {
    next(err);
  }

});
//////////////////////////////////////////////////

router.post('/exchange/{exchange}/login', async (req, res, next) => {
  try{
    req.body['exchange'] = req.params.exchange;
    getRequestsExecuter().login(req, res, next);
  }
  catch(err) {
    next(err);
  }

});

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
