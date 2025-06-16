require("dotenv").config();
const { ApolloServer } = require("apollo-server");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const resolvers = require("./resolvers");

// Load GraphQL schema
const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema.graphql"),
  "utf8"
);

// Database connection function
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    console.log("MongoDB connected successfully");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });
  } catch (err) {
    console.error("MongoDB initial connection failed:", err);
    process.exit(1);
  }
};

async function startServer() {
  try {
    await connectDB();

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      debug: true,
      context: ({ req }) => ({ req }),
      plugins: [
        {
          async serverWillStart() {
            console.log("Server starting up");
          },
        },
      ],
    });

    const { url } = await server.listen({
      port: process.env.PORT || 4002,
    });
    console.log(`🚀 Playlist service ready at ${url}`);
  } catch (err) {
    console.error("Failed to start Apollo Server:", err);
    process.exit(1);
  }
}

// Catch uncaught promise rejections globally
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

startServer();
