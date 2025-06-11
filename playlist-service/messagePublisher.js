const amqp = require("amqplib");
require("dotenv").config();

const EXCHANGE_NAME = "topic_logs";
const ROUTING_KEY = "playlist.updated";

let channel;

async function connectRabbitMQ() {
  if (channel) return;
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
}

async function publishPlaylistUpdated(playlist) {
  if (!channel) await connectRabbitMQ();
  const msg = JSON.stringify(playlist);
  channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(msg));
  console.log(`Published playlist.updated event: ${msg}`);
}

module.exports = { publishPlaylistUpdated };
