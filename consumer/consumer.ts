import {
  Consumer,
  ConsumerSubscribeTopics,
  EachBatchPayload,
  Kafka,
  EachMessagePayload,
  logLevel
} from 'kafkajs'
import crypto from 'node:crypto'

export interface MessageProcessor {
  topic: string;
  groupId: string;
  processed: number;
  onMessage: (messagePayload: EachMessagePayload) => Promise<void>;
}

export default class MessageConsumer {
  private kafkaConsumer: Consumer
  private messageProcessor: MessageProcessor

  public constructor(messageProcessor: MessageProcessor) {
    this.messageProcessor = messageProcessor
    this.kafkaConsumer = this.createKafkaConsumer()
  }

  public async initConsumer(): Promise<void> {
    const topic: ConsumerSubscribeTopics = {
      topics: [this.messageProcessor.topic],
      fromBeginning: false
    }
    await this.kafkaConsumer.connect()
    await this.kafkaConsumer.subscribe(topic)
  }

  public async startConsumer(): Promise<void> {
    try {
      await this.kafkaConsumer.run({
        partitionsConsumedConcurrently: 2, // Default: 1, set to #num partitions
        eachMessage: async (messagePayload: EachMessagePayload) => {
          await this.messageProcessor.onMessage(messagePayload)
          await messagePayload.heartbeat()
        }
      })
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  public async startBatchConsumer(): Promise<void> {
    try {
       await this.kafkaConsumer.run({
        partitionsConsumedConcurrently: 2, // Default: 1, set to #num partitions
        eachBatch: async (eachBatchPayload: EachBatchPayload) => {
          const { batch } = eachBatchPayload
          for (const message of batch.messages) {
            const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`
            console.log(`- ${prefix} ${message.key}#${message.value}`)
          }
          await eachBatchPayload.heartbeat()
        }
      })
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  public processed(): number {
    return this.messageProcessor.processed;
  }

  public async shutdown(): Promise<void> {
    await this.kafkaConsumer.disconnect()
  }

  private createKafkaConsumer(): Consumer {
    const id = crypto.randomBytes(16).toString("hex");
    const kafka = new Kafka({
      clientId: `client-id`,
      brokers: process.env?.BROKERS?.split(",") ?? ['kafka:9092'],
      logLevel: logLevel.ERROR,
    })
    const consumer = kafka.consumer({
      groupId: this.messageProcessor.groupId,
    })
    return consumer
  }
}

