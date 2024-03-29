import {
    EachMessagePayload
} from 'kafkajs'
import { MessageProcessor } from '../consumer';
import { EmailMessage } from 'published-packages';

export default class EmailMessageProcessor implements MessageProcessor {
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
        const { topic, partition, message } = messagePayload
        const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
        const msg: EmailMessage | null = JSON.parse(message?.value?.toString() || '')
        console.log(`- ${prefix} ${message.key}#${message.value}`)
        return;
    }
}