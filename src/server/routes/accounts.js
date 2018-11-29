import uuidv4 from 'uuid/v4';
import osprey from 'osprey';
import { Producer, Client } from 'kafka-node';
import logger from 'logger';

const endpoint = '/accounts';
const kafka_ip = 'localhost';
const kafka_port = '2181';
const client = new Client(kafka_ip + ':' + kafka_port);
const producer = new Producer(client);

let router = osprey.Router();
let producer_ready = false;

producer.on('ready', () => {
  producer_ready = true;
});

// Send an order to be executed on Smart-Trader. When a price isn't sent the order is executed as a market order.
// Trigger deposit to exchanges, return deposit addresses
router.post(endpoint + '/{accountName}/trades', async (req, res, next) => {
  const orderId = uuidv4();
  logger.debug('Incoming trade order: %s', orderId);
  const account = req.params.accountName;
  const action = req.body.actionType;
  const assetPair = req.body.assetPair;
  const duration = req.body.durationMinutes;
  const size = req.body.size;
  const price = req.body.price;
  let asset;

  if (action === 'sell') {
    asset = assetPair.split('-')[0];
  }
  else {
    asset = assetPair.split('-')[1];
  }

  let dbMessage = {
    orderId: orderId,
    account: account,
    action: action,
    assetPair: assetPair,
    duration: duration,
    size: size,
    price: price
  };

  let depositMessage = {
    orderId: orderId,
    account: account,
    asset: asset,
    size: size
  };

  // TODO: write to Kafka both messages
  logger.debug('Write order in DB - %o', dbMessage);
  if(producer_ready) {
    producer.send([{
      topic: 'dbListener', partition: 0, messages: [JSON.stringify(dbMessage)],
      attributes: 0
    }], (err, result) => {
      if(err) {
        logger.warn('Error while sending dbListener message to Kafka: %s', err);
        res.status = 500;
      }
      else {
        logger.debug('Message dbListener finished: %o', result);
      }
    });
  }
  logger.debug('Trigger deposit on order - %o', depositMessage);
  if(producer_ready) {
    producer.send([{
      topic: 'requestDepositAddress', partition: 0, messages: [JSON.stringify(depositMessage)],
      attributes: 0
    }], (err, result) => {
      if(err) {
        logger.warn('Error while sending deposit message to Kafka: %s', err);
        res.status = 500;
      }
      else {
        logger.debug('Message deposit finished: %o', result);
      }
    });
  }
  // TODO: res - {
  //   "actionType": "sell",
  //   "size": 1001,
  //   "assetPair": "BTC-USD",
  //   "tradeOrderId": "ABC2D",
  //   "walletPlane": [
  //     {
  //       "walletAddress": "bc1qdp9q0lae7vz9vn4drw4e48kqkk44sccp34008s",
  //       "amount": 750
  //     },
  //     {
  //       "walletAddress": "rj5qdp9q0lae7vz9vn4drw4e48kqkk44sccp34118s",
  //       "amount": 251
  //     }
  //   ]
  // }
  let resJson = {};
  resJson.actionType = action;
  resJson.size = size;
  resJson.assetPair = assetPair;
  res.json(resJson);


  // try {
  //   const requestsExecuter = getRequestsExecuter();
  //   requestsExecuter.validateAccount(req.params.accountName);
  //   req.body['account'] = req.params.accountName;
  //   // req.body['exchange'] = 'bitstamp';
  //   req.body['currencyPair'] = req.body.assetPair;
  //   const action = req.body.actionType;


  //   if (action == 'buy' || action == 'sell') {
  //     if (req.body.price) {
  //       if (!req.body['durationMinutes'] || req.body['durationMinutes'] === 0) {
  //         getRequestsExecuter().sendOrder(req, res, orderTypes.ImmediateOrCancel);
  //       }
  //       else {
  //         getRequestsExecuter().sendOrder(req, res, orderTypes.timedMaking);
  //       }
  //     }
  //     else {
  //       getRequestsExecuter().sendOrder(req, res, orderTypes.timedTaking);
  //     }
  //   }
  //   else {
  //     throw new Error(`unknown action type ${action}`);
  //   }
  // }
  // catch (err) {
  //   next(err);
  // }
});

export default router;
