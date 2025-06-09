const Review = require("./Reviews");
const {
  publishReviewCreated,
  publishHistoryCreated,
} = require("./messagePublisher"); // Add publishHistoryCreated
const BAD_LANG_API_URL =
  "https://stroke-belize-publicity-chart.trycloudflare.com/graphql";

const resolvers = {
  Query: {
    reviews: async () => await Review.findAll(),
    review: async (_, { id }) => await Review.findByPk(id),
  },
  Mutation: {
    addReview: async (_, { userId, movieId, content }) => {
      const fetch = (await import("node-fetch")).default;

      const query = `
        query CheckText($input: String!) {
          checkText(input: $input) {
            word
            category
            suggestions
            severity
            contextDependent
            aiDetectable
            geminiExplanation
          }
        }
      `;

      const response = await fetch(BAD_LANG_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { input: content } }),
      });

      const result = await response.json();

      if (result.data?.checkText && result.data.checkText.length > 0) {
        throw new Error("Review contains inappropriate language");
      }

      // Create the review
      const newReview = await Review.create({ userId, movieId, content });
      await publishReviewCreated(newReview);

      // Instead of creating history directly, publish a message for History service to handle
      await publishHistoryCreated({
        userId,
        movieId,
        watchedAt: new Date().toISOString(),
        reviewId: newReview.id,
      });

      return newReview;
    },
  },
};

module.exports = resolvers;
