import logger from 'logger';
import { NotificationsString }  from  'smart-trader-common';
import moment from 'moment';
import { Module } from 'moduleInfo';
import getWebsocketWrapper from 'websocketWrapper';
import kafka from 'kafka-node';

const Producer = kafka.Producer;
const KeyedMessage = kafka.KeyedMessage;
const webSocketWrapper = getWebsocketWrapper();



let PARTITION = 0;
let OrdersTopic = null;

class EventQueue {
  constructor(params) {
    //  order  producer initialization
    OrdersTopic = params.ordersTopic;
    this.balancesTopic = params.balancesTopic;
    this.notificationsTopic = params.notificationsTopic;
    this.client1 = new kafka.Client(params.kafkaZookeeperUrl + ':' + params.kafkaZookeeperPort);
    this.client2 = new kafka.Client(params.kafkaZookeeperUrl + ':' + params.kafkaZookeeperPort);
    this.producer = new Producer(this.client1);

    this.producer.on('ready', function () {
      this.client.refreshMetadata([OrdersTopic], (err) => {
        if (err) {
          logger.warn('Error refreshing kafka metadata %s', err);
        }
      });
    });

    this.producer.on('error', function (err) {
      logger.error(err);
    });

    // notification client
    // let notificationClient = new kafka.Client('localhost:2182');
    let topics = [{ topic: this.notificationsTopic, partition: PARTITION }];
    let options = { autoCommit: true, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 };
    this.consumer = new kafka.Consumer(this.client1, topics, options);
    this.offset = new kafka.Offset(this.client1);


    this.consumer.on('message', function (message) {
      webSocketWrapper.broadcast(NotificationsString[message.key] + '  ' + message.value);
      console.log('NOTIFICATION type - ' + NotificationsString[message.key] + ' value  = ' + message.value);
    });

    this.consumer.on('error', function (err) {
      logger.error('Kafka experienced an error - %s', err);
    });




    let balanceTopic = [{ topic: this.balancesTopic, partition: PARTITION }];
    this.balanceConsumer = new kafka.Consumer(this.client2, balanceTopic, options);
    this.balanceOffset = new kafka.Offset(this.client2);


    this.balanceConsumer.on('message', function (message) {
      logger.info('BALANCE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ---> %s', message.value);
    });

    this.balanceConsumer.on('error', function (err) {
      logger.error('Kafka experienced an error - %s', err);
    });
  }

  sendRequest(requestType, parameters) {
    parameters['eventTimeStamp'] = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    let keyedMessage = new KeyedMessage(requestType, JSON.stringify(parameters));

    this.producer.send([{ topic: OrdersTopic, partition: PARTITION, messages: [keyedMessage] }], function (err, result) {
      if (err) {
        logger.error(err);
      }
      else {
        logger.debug('%o', result);
      }
    });
  }

  sendNotification(notificationType, parameters) {
    parameters['eventTimeStamp'] = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    parameters['sendingModule'] = Module.name;
    let keyedMessage = new KeyedMessage(notificationType, JSON.stringify(parameters));
    this.producer.send([{ topic: this.notificationsTopic, partition: PARTITION, messages: [keyedMessage] }], function (err, result) {
      if (err) {
        logger.error(err);
      }
      else {
        logger.debug('%o', result);
      }
    });
  }
}


export default EventQueue;