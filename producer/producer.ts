import { Kafka, logCreator, logLevel, Producer, ProducerBatch } from 'kafkajs'

interface CustomMessageFormat { a: string }
interface Message { key?: string, value: string }
interface TopicMessages {
  topic: string,
  messages: Message[]
}
interface TopicMessage {
  topic: string,
  messages: Message[]
}
export default class ProducerFactory {
  private producer?: Producer
  private topic: string;
  public messages: number;

  constructor(topic: string) {
    this.topic = topic;
    this.messages = 0;
  }

  public async init() {
    this.producer = await this.createProducer(this.topic)
  }

  public async connect(): Promise<void> {
    try {
      await this.producer?.connect()
    } catch (error) {
      console.log('Error connecting the producer: ', error)
    }
  }

  public async shutdown(): Promise<void> {
    await this.producer?.disconnect()
  }

  public async sendMessage(msg: CustomMessageFormat): Promise<void> {
    // no key will send rount-robin to partitions
    const topicMessage: TopicMessage = {
      topic: this.topic,
      messages: [{ value: JSON.stringify(msg) }]
    }
    this.messages += 1;
    await this.producer?.send(topicMessage)
  }

  public async sendBatch(topic: string, messages: Array<CustomMessageFormat>): Promise<void> {
    const kafkaMessages: Array<Message> = messages.map((message) => {
      return {
        key: '',
        value: JSON.stringify(message)
      }
    })

    const topicMessages: TopicMessages = {
      topic: topic,
      messages: kafkaMessages
    }

    const batch: ProducerBatch = {
      topicMessages: [topicMessages]
    }

    await this.producer?.sendBatch(batch)
  }

  private async createProducer(topic: string): Promise<Producer|undefined> {
    try {
      const kafka = new Kafka({
        clientId: 'producer-id',
        brokers: process.env?.BROKERS?.split(",") ?? ['kafka:9092'],
        logLevel: logLevel.ERROR,
      })
      const admin = kafka.admin();
      await admin.createTopics({
        topics: [{
          topic: topic,
          numPartitions: 2,
          replicationFactor: 1
        }]
      })
      return kafka.producer();
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }
}
