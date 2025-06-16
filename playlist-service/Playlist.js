const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    movieNames: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) =>
          arr.length > 0 &&
          arr.every((m) => typeof m === "string" && m.trim().length > 0),
        message: "Must contain at least one valid movie name",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Playlist", playlistSchema);
