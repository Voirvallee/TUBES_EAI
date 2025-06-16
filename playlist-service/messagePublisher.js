const amqp = require("amqplib");
require("dotenv").config();

const EXCHANGE_NAME = "topic_logs";
const ROUTING_KEY = "playlist.updated";
const RABBITMQ_TIMEOUT = 5000; // 5 seconds

let channel;
let connection;

async function connectRabbitMQ() {
  if (channel) return;

  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL, {
      timeout: RABBITMQ_TIMEOUT,
    });
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    console.log("✅ RabbitMQ connected");
  } catch (err) {
    console.error("❌ RabbitMQ connection failed:", err.message);
    channel = null;
    throw err; // Throw only for initial setup (resolver handles publish errors)
  }
}

async function safePublish(message) {
  try {
    if (!channel) await connectRabbitMQ();
    const success = channel.publish(
      EXCHANGE_NAME,
      ROUTING_KEY,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    return success;
  } catch (err) {
    console.error("❌ RabbitMQ publish failed:", err.message);
    return false;
  }
}

async function publishPlaylistUpdated(playlist) {
  const success = await safePublish(playlist);
  if (success) {
    console.log(`✅ Published playlist update: ${playlist.id}`);
  } else {
    console.warn("⚠️ Playlist update not published (non-critical)");
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  if (connection) await connection.close();
  process.exit(0);
});

module.exports = { publishPlaylistUpdated };
