const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  registeredAt: String,
});

module.exports = mongoose.model("User", userSchema);
