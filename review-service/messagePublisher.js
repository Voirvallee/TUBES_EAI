const amqp = require("amqplib");
require("dotenv").config();

const EXCHANGE_NAME = "topic_logs";
const ROUTING_KEY = "review.created";

let channel;

async function connectRabbitMQ() {
  if (channel) return;
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
}

async function publishReviewCreated(review) {
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
}

module.exports = { publishReviewCreated };
