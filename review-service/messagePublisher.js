const amqp = require("amqplib");
require("dotenv").config();

const EXCHANGE_NAME = "topic_logs";
const ROUTING_KEY = "review.created";

let channel;

async function connectRabbitMQ() {
  if (channel) return channel;
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
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
    const msg = JSON.stringify({
      id: review.id,
      userId: review.userId,
      movieId: review.movieId,
      content: review.content,
      timestamp: review.timestamp,
    });
    channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(msg));
    console.log(`Published review.created event: ${msg}`);
  } catch (error) {
    console.error("Failed to publish review.created event:", error);
  }
}

module.exports = { publishReviewCreated, connectRabbitMQ };
