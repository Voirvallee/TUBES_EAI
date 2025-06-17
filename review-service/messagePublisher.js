const amqp = require("amqplib");
require("dotenv").config();

const EXCHANGE_NAME = "topic_logs";
const ROUTING_KEY = "review.created";

let channel;
let connection;

async function connectRabbitMQ() {
  if (channel) return channel;

  try {
    connection = await amqp.connect(
      process.env.RABBITMQ_URL || "amqp://rabbitmq"
    );
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    console.log("Connected to RabbitMQ");
    return channel;
  } catch (error) {
    console.error("RabbitMQ connection error:", error);
    throw error;
  }
}

async function publishReviewCreated(review) {
  try {
    if (!channel) await connectRabbitMQ();

    const message = {
      id: review.id,
      userName: review.userName,
      movieTitle: review.movieTitle,
      content: review.content,
      timestamp: review.timestamp,
    };

    const msgBuffer = Buffer.from(JSON.stringify(message));

    channel.publish(EXCHANGE_NAME, ROUTING_KEY, msgBuffer);
    console.log(
      `Published review.created event: ${JSON.stringify(message)}`
    );
  } catch (error) {
    console.error("Failed to publish review.created event:", error);
  }
}

process.on("SIGINT", async () => {
  if (connection) await connection.close();
  process.exit(0);
});

module.exports = { publishReviewCreated };
