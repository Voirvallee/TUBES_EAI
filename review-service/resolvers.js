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
      // Check for inappropriate language
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

      // Create the review
      const newReview = await Review.create({ userName, movieTitle, content });
      
      try {
        // Publish review created event
        await publishReviewCreated(newReview);
        
        // Create and publish history event
        const historyData = {
          userId: userName, // Assuming userName can be used as userId
          movieId: movieTitle, // Assuming movieTitle can be used as movieId
          watchedAt: new Date().toISOString(),
          reviewId: newReview.id
        };
        
        await publishHistoryCreated(historyData);
        
        return newReview;
      } catch (error) {
        // If event publishing fails, you might want to handle this
        console.error("Error publishing events:", error);
        // You could choose to delete the review here if event publishing is critical
        throw new Error("Review created but failed to publish events");
      }
    },
  },
};

module.exports = resolvers;