const amqp = require("amqplib");
require("dotenv").config();

const EXCHANGE_NAME = "topic_logs";
const ROUTING_KEY = "movie.added";

let channel;

async function connectRabbitMQ() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
}

async function publishMovieAdded(movie) {
  if (!channel) await connectRabbitMQ();
  const msg = JSON.stringify({
    id: movie._id,
    title: movie.title,
    description: movie.description,
    releaseDate: movie.releaseDate,
  });
  channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(msg));
  console.log(`Published movie.added event: ${msg}`);
}

module.exports = { publishMovieAdded };
