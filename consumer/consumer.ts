import {
  Consumer,
  ConsumerSubscribeTopics,
  EachBatchPayload,
  Producer,
  Kafka,
  EachMessagePayload,
  logLevel,
  TopicMessages
} from 'kafkajs'
const { DLQ, failureAdapters } = require('../../kafkajs-dlq')
import crypto from 'node:crypto'

export interface MessageProcessor {
  topic: string;
  groupId: string;
  processed: number;
  replayMessage: any;
  producer: Producer;
  onMessage: (messagePayload: EachMessagePayload) => Promise<void>;
}

export default class MessageConsumer {
  private kafka: Kafka;
  private dlq: typeof DLQ;
  private kafkaConsumer: Consumer;
  private kafkaProducer: Producer;
  private messageProcessor: MessageProcessor;
  private failureAdapter: any;

  public constructor(messageProcessor: MessageProcessor) {
    this.messageProcessor = messageProcessor;
    this.kafka = new Kafka({
      clientId: `client-id`,
      brokers: process.env?.BROKERS?.split(",") ?? ['kafka:9092'],
      logLevel: logLevel.ERROR,
    });
    this.dlq = new DLQ({ client: this.kafka });
    const id = crypto.randomBytes(16).toString("hex");
    this.kafkaConsumer = this.kafka.consumer({
      groupId: this.messageProcessor.groupId,
    });
    this.failureAdapter = new failureAdapters.Kafka({
      client: this.kafka,
      topic: `${this.messageProcessor.topic}-deadletter-queue`
    })
    this.kafkaProducer = this.kafka.producer();
    this.messageProcessor.replayMessage = this.replayMessage;
    this.messageProcessor.producer = this.kafkaProducer;
  }

  public async initConsumer(): Promise<void> {
    const topic: ConsumerSubscribeTopics = {
      topics: [this.messageProcessor.topic],
      fromBeginning: true
    }
    await this.kafkaProducer.connect();
    await this.kafkaConsumer.connect();
    await this.kafkaConsumer.subscribe(topic);
  }

  public async startConsumer(): Promise<void> {
    const { eachMessage } = this.dlq.consumer({
      topics: {
        [this.messageProcessor.topic]: { failureAdapter: this.failureAdapter }
      },
      consumer: this.kafkaConsumer,
      eachMessage: async (messagePayload: EachMessagePayload) => {
        await this.messageProcessor.onMessage(messagePayload);
        await messagePayload.heartbeat();
      }
    })
    await this.kafkaConsumer.run({
      partitionsConsumedConcurrently: 2, // Default: 1, set to #num partitions
      eachMessage
    })
  }

  public async startBatchConsumer(): Promise<void> {
    try {
      await this.kafkaConsumer.run({
        partitionsConsumedConcurrently: 2, // Default: 1, set to #num partitions
        eachBatch: async (eachBatchPayload: EachBatchPayload) => {
          const { batch } = eachBatchPayload
          for (const message of batch.messages) {
            const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`;
            console.log(`- ${prefix} ${message.key}#${message.value}`);
          }
          await eachBatchPayload.heartbeat();
        }
      })
    } catch (error) {
      console.log('Error: ', error);
    }
  }

  public async replayMessage(producer: Producer, topic: string, messagePayload: EachMessagePayload): Promise<void> {
    // from 'example-topic-deadletter-queue' to 'example-topic'
    let original = topic.split('-');
    original.splice(2);
    const originalTopic = original.join('-');
    const topicMessage: TopicMessages = {
      topic: originalTopic,
      messages: [messagePayload.message]
    }
    await producer.send(topicMessage);
  }

  public processed(): number {
    return this.messageProcessor.processed;
  }

  public async shutdown(): Promise<void> {
    await this.kafkaConsumer.disconnect();
  }
}

