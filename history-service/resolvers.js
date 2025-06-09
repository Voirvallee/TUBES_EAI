const History = require("./History");
const { publishHistoryUpdated } = require("./messagePublisher");

const resolvers = {
  Query: {
    histories: async () => await History.findAll(),
    history: async (_, { id }) => await History.findByPk(id),
    historiesByUser: async (_, { userId }) =>
      await History.findAll({ where: { userId } }),
  },
  Mutation: {
    addHistory: async (_, { userId, movieId, watchedAt, reviewId }) => {
      const history = await History.create({
        userId,
        movieId,
        watchedAt,
        reviewId,
      });
      await publishHistoryUpdated(history);
      return history;
    },
  },
};

module.exports = resolvers;
