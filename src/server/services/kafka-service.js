const PARTITION = 0
module.exports = class kafkaListener {
    constructor({ config, logger, kafka }) {
        this.config = config
        this.logger = logger
        this.kafka = kafka
        const consumerTopics = config.topics.consumer.map ( topic => ({ topic, partition : 0 }))
        const consumerOptions = { autoCommit: true, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 }
        const errorLog = (err) => {
            this.logger.error('Kafka experienced an error ', err)
        }
        const log = (msg) => {
            this.logger.info('Kafka:  ' + msg)
        }
        this.client = new kafka.Client(config.host + ':'  + config.port)
        this.producer = new kafka.Producer(this.client)
        this.producer.on('ready', function () {
            this.client.refreshMetadata(config.topics.producer, (err) => {
                if (err) {
                    errorLog(err)
                } else {
                    log(' connect!')
                }
            })
        })
        this.producer.on('error', function (err) {
            if (err) {
                errorLog( err)
            }
        })

        this.consumer = new kafka.Consumer(this.client, consumerTopics, consumerOptions)
        this.consumer.on('error', errorLog)
    }
    listen (handler = ()=>{}) {
        this.consumer.on('message',handler)
    }
    send (topic, type, message) {
        const errorLog = (err) => {
            this.logger.error('Kafka experienced an error ', err)
        }

        const log = (msg) => {
            this.logger.info('Kafka:  ' + msg)
        }
        const keyedMessage = new this.kafka.KeyedMessage(type, JSON.stringify(message))
        this.producer.send([{ topic, partition: PARTITION, messages: [keyedMessage] }], (err, result) => {
            if (err) {
                errorLog(err)
            }
            else {
                log(result)
            }
        })
    }
    close() {
        this.client.close()
    }
    testConnection() {
        //  this.send('test','testMssage','testing message')
    }
}