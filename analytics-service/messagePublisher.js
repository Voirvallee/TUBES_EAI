const amqp = require("amqplib");

const EXCHANGE_NAME = "topic_logs";
let connection;
let channel;

async function connectWithRetry(url, retries = 10, delayMs = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await amqp.connect(url);
      console.log("Connected to RabbitMQ");
      return conn;
    } catch (err) {
      console.log(
        `Failed to connect to RabbitMQ (attempt ${
          i + 1
        }/${retries}). Retrying in ${delayMs}ms...`
      );
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw new Error("Could not connect to RabbitMQ after multiple retries.");
}

async function connectRabbitMQ() {
  if (channel) return channel;

  const url = process.env.RABBITMQ_URL || "amqp://rabbitmq";
  connection = await connectWithRetry(url);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });

  console.log("Exchange ready");
  return channel;
}

async function publish(routingKey, message) {
  if (!channel) {
    await connectRabbitMQ();
  }
  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  console.log(`Published message to ${routingKey}:`, message);
}

process.on("SIGINT", async () => {
  if (connection) await connection.close();
  process.exit(0);
});

module.exports = { connectRabbitMQ, publish };
