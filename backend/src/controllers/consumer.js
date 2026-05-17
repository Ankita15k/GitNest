import kafka from '../kafka.js';

const consumer = kafka.consumer({ groupId: 'gitNest-worker-group'});

export const runConsumer = async () => {
    await consumer.connect();
    console.log('Kafka consumer connected successfully.');

    await consumer.subscribe({ topic : "git-repo-events", fromBeginning: false});

    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            const event = JSON.parse(message.value.toString());

            console.log(`📥 Received event from partition ${partition}:`, event.type);

           // Handle the heavy load background tasks based on event type

            switch (event.type) {
                case 'GIT_PUSH':
                    await handleHeavyGitCalculations(event.data);
                    break;
                default:
                    console.log('Unknown event type received');
            }
        },
    });
};

async function handleHeavyGitCalculations(data) {
    console.log(`⚙️ Processing git push for Repo: ${data.repoId} on branch: ${data.branch}...`);

    // Simulate a 2-second heavy DB/IO operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`🎉 Finished background processing for Repo: ${data.repoId}`);
}

// Start the consumer loop
runConsumer().catch(console.error);