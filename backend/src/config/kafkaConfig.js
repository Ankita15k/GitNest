import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'gitNest-app',
    brokers: ['localhost:9092'], // Update with your Kafka broker address
})

export default kafka;