import kafka from '../kafkaConfig.js';

const producer = kafka.producer();

export const connectProducer = async () => {
    await producer.connect();
    console.log('Kafka producer connected successfully.');
};

export const sendGitEvent = async (eventType, payload) => {
    try {
        await producer.send({
            topic: 'git-repo-events',
            messages: [
                {
                    key: payload.repoId,// Ensures events for the same repo go to the same partition
                    value : JSON.stringify({
                        type : eventType,
                        data: payload,
                        timestamp: new Date()
                    })
                },
            ],
        });
    } catch (error) {
        console.error("Failed to send event to Kafka: ", error);
    }
};