import logger from 'logger';
import { NotificationsString }  from  './notifications';
import moment from 'moment';
import { Module } from 'moduleInfo';

const kafka = require('kafka-node');
const Producer = kafka.Producer;
const KeyedMessage = kafka.KeyedMessage;

// globals - configurable
const ORDERS_TOPIC = 'orders';
const NOTIFICATIONS_TOPIC = 'notifications';
const PORT = '2181';
const URL = '127.0.0.1';

const BALANCES_TOPIC = 'balances';

let PARTITION = 0;

class EventQueue {
  constructor() {
    //  order  producer initialization
    this.client1 = new kafka.Client(URL + ':' + PORT);
    this.client2 = new kafka.Client(URL + ':' + PORT);
    this.producer = new Producer(this.client1);

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
    this.consumer = new kafka.Consumer(this.client1, topics, options);
    this.offset = new kafka.Offset(this.client1);


    this.consumer.on('message', function (message) {
      console.log('NOTIFICATION type - ' + NotificationsString[message.key] + ' value  = ' + message.value);
    });

    this.consumer.on('error', function (err) {
      logger.error('Kafka experienced an error - ' + err);
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



    let balanceTopic = [{ topic: BALANCES_TOPIC, partition: PARTITION }];
    this.balanceConsumer = new kafka.Consumer(this.client2, balanceTopic, options);
    this.balanceOffset = new kafka.Offset(this.client2);


    this.balanceConsumer.on('message', function (message) {
      logger.info('BALANCE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ---> ' + message.value);
    });

    this.balanceConsumer.on('error', function (err) {
      logger.error('Kafka experienced an error - ' + err);
    });

    this.balanceConsumer.on('offsetOutOfRange', function (topic) {
      topic.maxNum = 2;
      this.balanceOffset.fetch([topic], function (err, offsets) {
        if (err) {
          return console.error(err);
        }
        let min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
        this.consumer.setOffset(topic.topic, topic.partition, min);
      });
    });
  }

  sendRequest(requestType, parameters) {
    parameters['eventTimeStamp'] = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
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
    parameters['eventTimeStamp'] = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    parameters['sendingModule'] = Module.name;
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