const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    source: String,
    message: String,
    level: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", historySchema);
