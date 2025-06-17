const amqp = require("amqplib");
const History = require("./History");

const EXCHANGE_NAME = "topic_logs";
const QUEUE_NAME = "history-service";
const BINDING_KEYS = ["playlist.updated", "review.created"];

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

async function startSubscriber() {
  try {
    const connection = await connectWithRetry(
      process.env.RABBITMQ_URL || "amqp://rabbitmq"
    );
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    const q = await channel.assertQueue(QUEUE_NAME, { durable: false });

    for (const key of BINDING_KEYS) {
      await channel.bindQueue(q.queue, EXCHANGE_NAME, key);
    }

    console.log("History service subscribed to:", BINDING_KEYS.join(", "));

    channel.consume(q.queue, async (msg) => {
      if (msg !== null) {
        const routingKey = msg.fields.routingKey;
        const content = JSON.parse(msg.content.toString());

        let logData;

        if (routingKey === "playlist.updated") {
          logData = {
            source: "playlist-service",
            message: `Playlist updated: ${content.name} (Owner: ${content.ownerName})`,
            level: "INFO",
          };
        } else if (routingKey === "review.created") {
          logData = {
            source: "review-service",
            message: `Review created by ${content.userName} for movie: ${content.movieTitle}`,
            level: "INFO",
          };
        } else {
          logData = {
            source: "unknown",
            message: "Unknown event received",
            level: "WARN",
          };
        }

        await History.create(logData);
        console.log("Log saved:", logData);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Failed to start subscriber:", error);
  }
}

module.exports = { startSubscriber };
