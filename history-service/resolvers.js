const History = require("./History");

const resolvers = {
  Query: {
    logs: async () => await History.find().sort({ createdAt: -1 }),
    logsBySource: async (_, { source }) =>
      await History.find({ source }).sort({ createdAt: -1 }),
  },
  Mutation: {
    addLog: async (_, { source, message, level }) => {
      const log = new History({ source, message, level });
      return await log.save();
    },
  },
};

module.exports = resolvers;
