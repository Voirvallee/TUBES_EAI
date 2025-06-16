const amqp = require("amqplib");

let channel;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");
  } catch (err) {
    console.error("RabbitMQ connection failed:", err);
  }
}

async function publishAnalyticsUpdated(payload) {
  if (!channel) {
    console.warn("RabbitMQ not initialized.");
    return;
  }

  const queue = "analytics.updated";
  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
}

module.exports = {
  connectRabbitMQ,
  publishAnalyticsUpdated,
};
