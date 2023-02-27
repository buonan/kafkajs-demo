import {
    EachMessagePayload
} from 'kafkajs'
import { MessageProcessor } from '../consumer';

export default class EmailMessageProcessor implements MessageProcessor {
    topic: string;
    groupId: string;
    processed: number;

    constructor(topic: string, groupId: string) {
        this.topic = topic;
        this.groupId = groupId;
        this.processed = 0;
    }

    onMessage = async (messagePayload: EachMessagePayload): Promise<void> => {
        const { topic, partition, message } = messagePayload
        const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
        console.log(`- ${prefix} ${message.key}#${message.value}`)
    }
}