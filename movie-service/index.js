require("dotenv").config();
const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const resolvers = require("./resolvers");

const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema.graphql"),
  "utf8"
);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");

    const server = new ApolloServer({ typeDefs, resolvers });

    server.listen({ port: process.env.PORT || 4001 }).then(({ url }) => {
      console.log(`Movie service running at ${url}`);
    });
  } catch (error) {
    console.error(error);
  }
}

startServer();
