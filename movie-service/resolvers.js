const Movie = require("./Movie");
const { publishMovieAdded } = require("./messagePublisher");

const resolvers = {
  Query: {
    movies: async () => await Movie.find(),
    movie: async (_, { id }) => await Movie.findById(id),
  },
  Mutation: {
    addMovie: async (_, { title, description, releaseDate }) => {
      const newMovie = new Movie({ title, description, releaseDate });
      await newMovie.save();
      await publishMovieAdded(newMovie);
      return newMovie;
    },
  },
};

module.exports = resolvers;
