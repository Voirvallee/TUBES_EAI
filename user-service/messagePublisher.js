const amqp = require("amqplib");
require("dotenv").config();

const EXCHANGE_NAME = "topic_logs";
const ROUTING_KEY = "user.registered";

let channel;

async function connectRabbitMQ() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
}

async function publishUserRegistered(user) {
  if (!channel) await connectRabbitMQ();
  const msg = JSON.stringify({
    id: user._id,
    name: user.name,
    email: user.email,
    registeredAt: user.registeredAt,
  });
  channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(msg));
  console.log(`Published user.registered event: ${msg}`);
}

module.exports = { publishUserRegistered };
