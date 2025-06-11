require("dotenv").config();
const { ApolloServer } = require("apollo-server");
const fs = require("fs");
const path = require("path");
const resolvers = require("./resolvers");

const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema.graphql"),
  "utf8"
);

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  server.listen({ port: process.env.PORT || 4002 }).then(({ url }) => {
    console.log(`Playlist service running at ${url}`);
  });
}

startServer();
