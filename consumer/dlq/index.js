const { Kafka } = require('kafkajs')
const { DLQ, failureAdapters } = require('../../kafkajs-dlq')

const client = new Kafka({
  clientId: `client-id`,
  brokers: process.env?.BROKERS?.split(",") ?? ['kafka:9092'],
})
const dlq = new DLQ({ client })
const topic = 'example-topic'
const failureAdapter = new failureAdapters.Kafka({ client, topic: `${topic}-deadletter-queue` })

const consumer = client.consumer({
  groupId: 'group-id',
})

const { eachMessage } = dlq.consumer({
  topics: {
    [topic]: { failureAdapter }
  },
  consumer,
  eachMessage: async ({ topic, partition, message }) => {
    throw new Error('Failed to process message')
  }
})


const run = async () => {
  await consumer.connect()
  await consumer.subscribe({ topic })
  await consumer.run({ eachMessage })
}

run()