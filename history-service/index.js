require("dotenv").config();
const { ApolloServer } = require("apollo-server");
const fs = require("fs");
const path = require("path");
const resolvers = require("./resolvers");
const sequelize = require("./db");

const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema.graphql"),
  "utf8"
);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPostgres(retries = 10, delayMs = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log("PostgreSQL is ready");
      return;
    } catch (error) {
      console.log(
        `Postgres not ready, retrying in ${delayMs / 1000}s... (${
          i + 1
        }/${retries})`
      );
      await delay(delayMs);
    }
  }
  throw new Error("PostgreSQL not ready after multiple attempts");
}

async function startServer() {
  try {
    await waitForPostgres();
    await sequelize.sync();
    console.log("PostgreSQL connected and synced");

    const server = new ApolloServer({ typeDefs, resolvers });

    server.listen({ port: process.env.PORT || 4005 }).then(({ url }) => {
      console.log(`History service running at ${url}`);
    });
  } catch (error) {
    console.error(error);
  }
}

startServer();
