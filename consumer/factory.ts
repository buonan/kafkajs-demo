import MessageConsumer from "./consumer";
import MyExampleMessageProcessor from './example';
import EmailMessageProcessor from './email';

export default class Factory {
    create(name: string, topic: string) {
        switch (name) {
            case 'example':
                return new MessageConsumer(new MyExampleMessageProcessor(topic, `group-${name}`));
            case 'email':
                return new MessageConsumer(new EmailMessageProcessor(topic, `group-${name}`));
        }
    }
}