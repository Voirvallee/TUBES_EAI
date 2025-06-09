const amqp = require("amqplib");
require("dotenv").config();

const EXCHANGE_NAME = "topic_logs";
const ROUTING_KEY = "genre.updated";

let channel;

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectRabbitMQ(retries = 5, delayMs = 3000) {
  if (channel) return channel;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
      console.log("Connected to RabbitMQ");
      return channel;
    } catch (err) {
      console.error(
        `RabbitMQ connection attempt ${attempt} failed: ${err.message}`
      );
      if (attempt < retries) {
        console.log(`Retrying in ${delayMs / 1000} seconds...`);
        await delay(delayMs);
      } else {
        console.error("Failed to connect to RabbitMQ after multiple attempts.");
        throw err;
      }
    }
  }
}

async function publishGenreUpdated(genre) {
  if (!channel) await connectRabbitMQ();
  const msg = JSON.stringify(genre);
  channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(msg));
  console.log(`Published genre.updated event: ${msg}`);
}

// Start a simple HTTP server to keep the process alive and allow manual publishing via HTTP
const http = require("http");

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/publish") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const genre = JSON.parse(body);
        await publishGenreUpdated(genre);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "success", genre }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "error", message: err.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  console.log(`Genre service running on port ${PORT}`);

  try {
    await publishGenreUpdated({ id: 1, name: "Initial Genre" });
  } catch (err) {
    console.error("Failed to publish initial genre update:", err.message);
  }
});
