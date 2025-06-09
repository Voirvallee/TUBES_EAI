const Rating = require("./Ratings");
const {
  publishRatingUpdated,
  publishHistoryCreated,
} = require("./messagePublisher"); // add publishHistoryCreated

const resolvers = {
  Query: {
    ratings: async () => await Rating.find(),
    rating: async (_, { userId, movieId }) =>
      await Rating.findOne({ userId, movieId }),
  },
  Mutation: {
    addOrUpdateRating: async (_, { userId, movieId, rating }) => {
      let ratingDoc = await Rating.findOne({ userId, movieId });
      if (ratingDoc) {
        ratingDoc.rating = rating;
        await ratingDoc.save();
      } else {
        ratingDoc = new Rating({ userId, movieId, rating });
        await ratingDoc.save();
      }
      await publishRatingUpdated(ratingDoc);

      await publishHistoryCreated({
        userId,
        movieId,
        watchedAt: new Date().toISOString(),
      });

      return ratingDoc;
    },
  },
};

module.exports = resolvers;
