let kafka = require('kafka-node');
let Producer = kafka.Producer;
let KeyedMessage = kafka.KeyedMessage;


// globals - configurable
let TOPIC = 'orders';
let PARTITION = 0;
import logger from 'logger';
class EventQueue {
  constructor() {

    let client = new kafka.Client('localhost:2181');
    this.producer = new Producer(client);

    this.producer.on('ready', function () {
      client.refreshMetadata([TOPIC], (err) => {
        if (err) {
          console.warn('Error refreshing kafka metadata', err);
        }
      });
    });

    this.producer.on('error', function (err) {
      console.log('error', err);
    });
  }

  sendRequest(requestType, parameters) {
    let keyedMessage = new KeyedMessage(requestType, JSON.stringify(parameters));

    this.producer.send([{ topic: TOPIC, partition: PARTITION, messages: [keyedMessage] }], function (err, result) {
      if (err) {
        logger.error(err);
      }
      else {
        logger.info(JSON.stringify(result));
      }
    });
  }
}
// class EventQueue {
//   constructor(orderExecuter) {
//     this.client = new kafka.Client('localhost:2181');
//     this.topics = [{ topic: 'orders', partition: 0 }];
//     this.options = { autoCommit: true, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 };
//     this.consumer = new kafka.Consumer(this.client, this.topics, this.options);
//     this.offset = new kafka.Offset(this.client);

//     this.consumer.on('message', function (message) {
//       orderExecuter.execute(message);
//     });

//     this.consumer.on('error', function (err) {
//       logger.err('Kafka expericanced an error - ' + err);
//     });

//     this.consumer.on('offsetOutOfRange', function (topic) {
//       topic.maxNum = 2;
//       this.offset.fetch([topic], function (err, offsets) {
//         if (err) {
//           return console.error(err);
//         }
//         let min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
//         this.consumer.setOffset(topic.topic, topic.partition, min);
//       });
//     });
//   }

//   eventOrderSuccess(order) {
//     console.log(order);
//   }

//   eventOrderFailed(order) {
//     console.log(order);
//   }
// }


export default EventQueue;