import logger from 'logger';
import moment from 'moment';
import { Module } from 'moduleInfo';
import kafka from 'kafka-node';


const Producer = kafka.Producer;
const KeyedMessage = kafka.KeyedMessage;


let PARTITION = 0;
const MAX_RETRIES = 3;

class EventQueue {
  constructor(params, handleMessageCb) {
    //  order  producer initialization
    this.ordersTopic = params.ordersTopic;
    // this.balancesTopic = params.balancesTopic;
    this.notificationsTopic = params.notificationsTopic;
    this.endpoint = params.endpoint;

    let topics = params.topics;
    let consumerGroupPrefix = Module.name;

    this.initConsumerGroup(consumerGroupPrefix, topics, handleMessageCb);
    this.initProducer();
  }

  initProducer() {
    this.client = new kafka.Client(this.endpoint);
    this.producer = new Producer(this.client);

    this.producer.on('ready', function () {
      this.client.refreshMetadata([this.ordersTopic], (err) => {
        if (err) {
          logger.warn('Error refreshing kafka metadata %s', err);
        }
      });
    }.bind(this));

    this.producer.on('error', function (err) {
      logger.error(err);
    });
  }

  initConsumerGroup(consumerGroupPrefix, topics, handleMessageCb) {
    let retries = MAX_RETRIES;
    try {
      let options = { autoCommit: true,
        fetchMaxWaitMs: 1000,
        fetchMaxBytes: 1024 * 1024,
        host: this.endpoint,
        groupId: `${consumerGroupPrefix}-${topics.join('-')}`,
        sessionTimeout: 15000,
        protocol: ['roundrobin']
      };
      this.consumer = new kafka.ConsumerGroup(options, topics);
      this.consumer.on('message', function (message) {
        handleMessageCb(message);
      })
      ;

      this.consumer.on('error', function (err) {
        logger.error('Kafka experienced an error - %s', err);
      });

    }
    catch(err) {
      logger.error('Error on kafka consumer:' + err);
      if (retries > 0) {
        retries--;
        this.initConsumerGroup(consumerGroupPrefix, topics);
      }
    }
  }

  sendRequest(requestType, parameters) {
    parameters['eventTimeStamp'] = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    let keyedMessage = new KeyedMessage(requestType, JSON.stringify(parameters));
    this.producer.send([{ topic: this.ordersTopic, partition: PARTITION, messages: [keyedMessage] }], function (err, result) {
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