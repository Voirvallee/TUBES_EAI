const resolvers = {
  Query: {
    playlists: async () => {
      try {
        return await Playlist.find();
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
        throw new Error("Failed to fetch playlists");
      }
    },
    playlist: async (_, { id }) => {
      try {
        return await Playlist.findById(id);
      } catch (error) {
        console.error(`Failed to fetch playlist with id ${id}:`, error);
        throw new Error("Failed to fetch playlist");
      }
    },
  },
  Mutation: {
    addPlaylist: async (_, { name, ownerName, movieNames, description }) => {
      try {
        const playlist = new Playlist({
          name,
          ownerName,
          movieNames,
          description,
        });
        await playlist.save();

        await publishPlaylistUpdated({
          id: playlist._id,
          name: playlist.name,
          ownerName: playlist.ownerName,
          movieNames: playlist.movieNames,
          description: playlist.description,
        });

        return playlist;
      } catch (error) {
        console.error("Failed to add playlist:", error);
        throw new Error("Failed to add playlist");
      }
    },
    updatePlaylist: async (
      _,
      { id, name, ownerName, movieNames, description }
    ) => {
      try {
        const playlist = await Playlist.findById(id);
        if (!playlist) {
          throw new Error("Playlist not found");
        }

        if (name !== undefined) playlist.name = name;
        if (ownerName !== undefined) playlist.ownerName = ownerName;
        if (movieNames !== undefined) playlist.movieNames = movieNames;
        if (description !== undefined) playlist.description = description;

        await playlist.save();

        await publishPlaylistUpdated({
          id: playlist._id,
          name: playlist.name,
          ownerName: playlist.ownerName,
          movieNames: playlist.movieNames,
          description: playlist.description,
        });

        return playlist;
      } catch (error) {
        console.error("Failed to update playlist:", error);
        throw new Error("Failed to update playlist");
      }
    },
  },
};
