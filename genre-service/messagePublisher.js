const amqp = require("amqplib");
require("dotenv").config();

const EXCHANGE_NAME = "topic_logs";
const ROUTING_KEY = "genre.updated";

let channel;

async function connectRabbitMQ() {
  if (channel) return;
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
}

async function publishGenreUpdated(genre) {
  if (!channel) await connectRabbitMQ();
  const msg = JSON.stringify(genre);
  channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(msg));
  console.log(`Published genre.updated event: ${msg}`);
}

module.exports = { publishGenreUpdated };
