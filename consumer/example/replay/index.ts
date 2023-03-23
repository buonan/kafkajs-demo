import {
    EachMessagePayload,
} from 'kafkajs'
import { MessageProcessor } from '../../consumer';

interface KafkaMessage { key?: string, value: string }
interface TopicMessage {
    topic: string,
    messages: KafkaMessage[]
  }

export default class MyExampleMessageReplayProcessor implements MessageProcessor {
    topic: string;
    groupId: string;
    processed: number;
    producer: any;
    replayMessage: any;

    constructor(topic: string, groupId: string) {
        this.topic = topic;
        this.groupId = groupId;
        this.processed = 0;
    }

    onMessage = async (messagePayload: EachMessagePayload): Promise<void> => {
        this.processed += 1;
        const { topic, partition, message } = messagePayload
        const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
        console.log(`- ${prefix} ${message.key}#${message.value}`)
        await this.replayMessage(this.producer, this.topic, messagePayload);
        return;
    }
}