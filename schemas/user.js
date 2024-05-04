const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  username: {
    type: String,
    unique: true,
  },
  addressLine1: {
    type: String,
  },
  city: {
    type: String,
  },
  village: {
    type: String,
  },
});

module.exports = mongoose.model("person", userSchema);
