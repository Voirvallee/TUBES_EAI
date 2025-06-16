const axios = require("axios");
const Playlist = require("./Playlist");
const { publishPlaylistUpdated } = require("./messagePublisher");

const USER_SERVICE_URL = "http://user-service:4000/graphql";
const MOVIE_SERVICE_URL = "http://movie-service:4001/graphql";

async function validateUser(ownerName) {
  const query = `
    query {
      users {
        id
        name
        registeredAt
      }
    }
  `;

  try {
    const res = await axios.post(USER_SERVICE_URL, { query });
    const users = res.data?.data?.users || [];
    return (
      users.find(
        (user) => user.name.toLowerCase() === ownerName.toLowerCase()
      ) || null
    );
  } catch (err) {
    console.error("User validation error:", err.message);
    return null;
  }
}

async function validateMovies(movieNames) {
  const query = `
    query {
      movies {
        id
        title
        description
        releaseDate
      }
    }
  `;

  try {
    const res = await axios.post(MOVIE_SERVICE_URL, { query });
    const movies = res.data?.data?.movies || [];
    const validMovies = movies.filter((movie) =>
      movieNames.includes(movie.title)
    );
    return validMovies;
  } catch (err) {
    console.error("Movie validation error:", err.message);
    return [];
  }
}

const resolvers = {
  Query: {
    playlists: async () => {
      try {
        const playlists = await Playlist.find();
        return playlists;
      } catch (error) {
        console.error("Failed to fetch playlists:", error.message);
        throw new Error("Failed to fetch playlists");
      }
    },

    playlist: async (_, { id }) => {
      try {
        const playlist = await Playlist.findById(id);
        return playlist;
      } catch (error) {
        console.error("Failed to fetch playlist:", error.message);
        throw new Error("Failed to fetch playlist");
      }
    },
  },

  Mutation: {
    addPlaylist: async (_, { name, ownerName, movieNames, description }) => {
      try {
        if (!name?.trim() || name.length < 2 || name.length > 100) {
          throw new Error("Name must be 2-100 characters");
        }

        if (!ownerName?.trim()) {
          throw new Error("Owner name is required");
        }

        if (!Array.isArray(movieNames) || movieNames.length === 0) {
          throw new Error("At least one valid movie name required");
        }

        const [user, validMovies] = await Promise.all([
          validateUser(ownerName),
          validateMovies(movieNames),
        ]);

        if (!user) {
          throw new Error(`User "${ownerName}" not found in user service`);
        }

        const invalidMovies = movieNames.filter(
          (movieName) => !validMovies.some((m) => m.title === movieName)
        );

        if (invalidMovies.length > 0) {
          throw new Error(`Invalid movies: ${invalidMovies.join(", ")}`);
        }

        const playlist = new Playlist({
          name: name.trim(),
          ownerName: ownerName.trim(),
          movieNames: movieNames.map((m) => m.trim()),
          description: description?.trim(),
        });

        const savedPlaylist = await playlist.save();

        const response = {
          id: savedPlaylist._id,
          name: savedPlaylist.name,
          ownerName: savedPlaylist.ownerName,
          movieNames: savedPlaylist.movieNames,
          description: savedPlaylist.description,
          createdAt: savedPlaylist.createdAt,
          updatedAt: savedPlaylist.updatedAt,
        };

        publishPlaylistUpdated(response).catch((err) =>
          console.error("Non-critical publish error:", err.message)
        );

        return response;
      } catch (error) {
        console.error("Playlist creation failed:", error.message);
        throw new Error(`Playlist creation failed: ${error.message}`);
      }
    },
  },

  // 🔧 🔧 THIS IS THE KEY ADDITION:
  Playlist: {
    id: (parent) => parent._id.toString(),
  },
};

module.exports = resolvers;
