const amqp = require("amqplib");
require("dotenv").config();

const EXCHANGE_NAME = "topic_logs";
const ROUTING_KEY = "rating.updated";

let channel;

async function connectRabbitMQ() {
  if (channel) return;
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
}

async function publishRatingUpdated(rating) {
  if (!channel) await connectRabbitMQ();
  const msg = JSON.stringify({
    id: rating._id,
    userId: rating.userId,
    movieId: rating.movieId,
    rating: rating.rating,
    createdAt: rating.createdAt,
    updatedAt: rating.updatedAt,
  });
  channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(msg));
  console.log(`Published rating.updated event: ${msg}`);
}

module.exports = { publishRatingUpdated };
