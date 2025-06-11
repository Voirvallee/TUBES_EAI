const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    movieNames: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "movieNames must have at least one movie",
      },
    },
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Playlist", playlistSchema);
