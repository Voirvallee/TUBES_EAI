const Review = require("./Reviews");
const {
  publishReviewCreated,
  publishHistoryCreated,
} = require("./messagePublisher");

const BAD_LANG_API_URL =
  "https://stroke-belize-publicity-chart.trycloudflare.com/graphql";

const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const resolvers = {
  Query: {
    reviews: async () => await Review.findAll(),
    review: async (_, { id }) => await Review.findByPk(id),
  },
  Mutation: {
    addReview: async (_, { userName, movieTitle, content }) => {

      const badLangQuery = `
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

      const badLangResponse = await fetch(BAD_LANG_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: badLangQuery, variables: { input: content } }),
      });

      const badLangResult = await badLangResponse.json();

      if (badLangResult.data?.checkText && badLangResult.data.checkText.length > 0) {
        throw new Error("Review contains inappropriate language");
      }

      const newReview = await Review.create({ userName, movieTitle, content });
      
      try {
        await publishReviewCreated(newReview);
        
        const historyData = {
          userId: userName,
          movieId: movieTitle,
          watchedAt: new Date().toISOString(),
          reviewId: newReview.id
        };
        
        await publishHistoryCreated(historyData);
        
        return newReview;
      } catch (error) {
        console.error("Error publishing events:", error);
        throw new Error("Review created but failed to publish events");
      }
    },
  },
};

module.exports = resolvers;