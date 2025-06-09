const Genre = require("./Genre");
const { publishGenreUpdated } = require("./messagePublisher");

const resolvers = {
  Query: {
    genres: async () => await Genre.find(),
    genre: async (_, { id }) => await Genre.findById(id),
  },
  Mutation: {
    addGenre: async (_, { name, description }) => {
      const genre = new Genre({ name, description });
      await genre.save();
      await publishGenreUpdated({ id: genre._id, name, description });
      return genre;
    },
    updateGenre: async (_, { id, name, description }) => {
      const genre = await Genre.findById(id);
      if (!genre) throw new Error("Genre not found");
      if (name !== undefined) genre.name = name;
      if (description !== undefined) genre.description = description;
      await genre.save();
      await publishGenreUpdated({
        id: genre._id,
        name: genre.name,
        description: genre.description,
      });
      return genre;
    },
  },
};

module.exports = resolvers;
