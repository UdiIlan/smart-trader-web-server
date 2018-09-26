import logger from 'logger';
import { NotificationsString }  from  './notifications';

const kafka = require('kafka-node');
const Producer = kafka.Producer;
const KeyedMessage = kafka.KeyedMessage;

// globals - configurable
const ORDERS_TOPIC = 'orders';
const NOTIFICATIONS_TOPIC = 'notifications';
const PORT = '2181';
const URL = 'localhost';

let PARTITION = 0;

class EventQueue {
  constructor() {
    //  order  producer initilization
    this.client = new kafka.Client(URL + ':' + PORT);
    this.producer = new Producer(this.client);

    this.producer.on('ready', function () {
      this.client.refreshMetadata([ORDERS_TOPIC], (err) => {
        if (err) {
          logger.warn('Error refreshing kafka metadata' +  err);
        }
      });
    });

    this.producer.on('error', function (err) {
      logger.error(err);
    });

    // notification client
    // let notificationClient = new kafka.Client('localhost:2182');
    let topics = [{ topic: NOTIFICATIONS_TOPIC, partition: PARTITION }];
    let options = { autoCommit: true, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 };
    this.consumer = new kafka.Consumer(this.client, topics, options);
    this.offset = new kafka.Offset(this.client);

    this.consumer.on('message', function (message) {
      console.log('NOTIFICATION type - ' + NotificationsString[message.key] + ' value  = ' + message.value);
    });

    this.consumer.on('error', function (err) {
      logger.error('Kafka expericanced an error - ' + err);
    });

    this.consumer.on('offsetOutOfRange', function (topic) {
      topic.maxNum = 2;
      this.offset.fetch([topic], function (err, offsets) {
        if (err) {
          return console.error(err);
        }
        let min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
        this.consumer.setOffset(topic.topic, topic.partition, min);
      });
    });
  }

  sendRequest(requestType, parameters) {
    let keyedMessage = new KeyedMessage(requestType, JSON.stringify(parameters));

    this.producer.send([{ topic: ORDERS_TOPIC, partition: PARTITION, messages: [keyedMessage] }], function (err, result) {
      if (err) {
        logger.error(err);
      }
      else {
        logger.debug(JSON.stringify(result));
      }
    });
  }

  sendNotification(notificationType, parameters) {
    let keyedMessage = new KeyedMessage(notificationType, JSON.stringify(parameters));

    this.producer.send([{ topic: NOTIFICATIONS_TOPIC, partition: PARTITION, messages: [keyedMessage] }], function (err, result) {
      if (err) {
        logger.error(err);
      }
      else {
        logger.debug(JSON.stringify(result));
      }
    });
  }
}


export default EventQueue;