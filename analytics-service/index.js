require("dotenv").config();
const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const resolvers = require("./resolvers");
const { connectRabbitMQ } = require("./messagePublisher");

const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema.graphql"),
  "utf8"
);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");

    await connectRabbitMQ();

    const server = new ApolloServer({ typeDefs, resolvers });

    const { url } = await server.listen({ port: process.env.PORT || 4004 });
    console.log(`Analytics service running at ${url}`);
  } catch (error) {
    console.error(error);
  }
}

startServer();
