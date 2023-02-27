import Factory from "./factory";
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

(async () => {
    const args = process.argv.slice(2);
    const CONSUMER_TOPIC = process.env.CONSUMER_TOPIC || args[0]
    const CONSUMER_NAME = process.env.CONSUMER_NAME || args[1]

    const consumer = new Factory().create(CONSUMER_NAME, CONSUMER_TOPIC);

    const shutdown = async () => {
        console.log('Shutting down');
        console.log(`Processed ${consumer?.processed()}`);
        await consumer?.shutdown();
    }
    process.on('SIGINT', function () {
        console.log("Caught SIGINT");
        shutdown();
        process.exit();
    });
    process.on('SIGTERM', function () {
        console.log("Caught SIGTERM");
        shutdown();
        process.exit();
    });
    process.on('SIGQUIT', function () {
        console.log("Caught SIGQUIT");
        shutdown();
        process.exit();
    });

    await consumer?.initConsumer();
    do {
        await consumer?.startConsumer();
        //await new Promise(f => setTimeout(f, 100));
    } while (true);
})();