import ProducerFactory from "./producer";
import { EmailMessage, SmsMessage } from "@buonan/published-packages";
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

(async () => {
    const args = process.argv.slice(2);
    const PRODUCER_TOPIC = process.env.PRODUCER_TOPIC || args[0]

    const producer = new ProducerFactory(PRODUCER_TOPIC);
    const shutdown = async () => {
        console.log('Shutting down');
        console.log(`Messages sent ${producer.messages}`);
        await producer.shutdown();
    }
    process.on('SIGINT', function() {
        console.log("Caught SIGINT");
        shutdown();
        process.exit();
    });
    process.on('SIGTERM', function() {
        console.log("Caught SIGTERM");
        shutdown();
        process.exit();
    });
    process.on('SIGQUIT', function() {
        console.log("Caught SIGQUIT");
        shutdown();
        process.exit();
    });
    await producer.init();
    await producer.connect();
    do {
        switch (PRODUCER_TOPIC) {
            case 'example-topic':
                // Send CustomMessageFormat
                await producer.sendMessage({ a: `hello ${new Date().toISOString()}`});
                break;
            case 'email-topic':
                // Send EmailMessage
                let emailMessage: EmailMessage = {
                    email: 'buonan@gmail.com',
                    created_at: new Date(),
                    message: 'Hello, world'
                }
                await producer.sendEmailMessage(emailMessage);
                break;
        }


        //await new Promise(f => setTimeout(f, 50));
    } while (true);
})();
