require("dotenv").config();
const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const resolvers = require("./resolvers");
const { startSubscriber } = require("./messageSubscriber");

const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema.graphql"),
  "utf8"
);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");

    const server = new ApolloServer({ typeDefs, resolvers });

    server.listen({ port: process.env.PORT || 4005 }).then(({ url }) => {
      console.log(`History service running at ${url}`);
      startSubscriber();
    });
  } catch (error) {
    console.error(error);
  }
}

startServer();
