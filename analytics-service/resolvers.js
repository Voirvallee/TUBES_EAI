const axios = require("axios");
const Analytics = require("./Analytics");

const USER_SERVICE_URL = "http://user-service:4000/graphql";
const MOVIE_SERVICE_URL = "http://movie-service:4001/graphql";
const REVIEW_SERVICE_URL = "http://review-service:4003/graphql";
const PLAYLIST_SERVICE_URL = "http://playlist-service:4002/graphql";

const resolvers = {
  Query: {
    systemSummary: async () => {
      const [usersRes, moviesRes, reviewsRes, playlistsRes] = await Promise.all(
        [
          axios.post(USER_SERVICE_URL, { query: "{ users { id } }" }),
          axios.post(MOVIE_SERVICE_URL, { query: "{ movies { id } }" }),
          axios.post(REVIEW_SERVICE_URL, { query: "{ reviews { id } }" }),
          axios.post(PLAYLIST_SERVICE_URL, { query: "{ playlists { id } }" }),
        ]
      );

      const summary = {
        totalUsers: usersRes.data.data.users.length,
        totalMovies: moviesRes.data.data.movies.length,
        totalReviews: reviewsRes.data.data.reviews.length,
        totalPlaylists: playlistsRes.data.data.playlists.length,
      };

      // ✅ Save the snapshot to MongoDB
      await Analytics.create({
        type: "system-summary",
        data: summary,
      });

      return summary;
    },

    topReviewedMovies: async (_, { limit }) => {
      const reviewQuery = `{ reviews { movieId } }`;
      const res = await axios.post(REVIEW_SERVICE_URL, { query: reviewQuery });
      const reviews = res.data.data.reviews;

      const countMap = {};
      for (const review of reviews) {
        countMap[review.movieId] = (countMap[review.movieId] || 0) + 1;
      }

      const topMovies = Object.entries(countMap)
        .map(([movieId, count]) => ({ movieId, reviewCount: count }))
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, limit);

      return topMovies;
    },
  },
};

module.exports = resolvers;
