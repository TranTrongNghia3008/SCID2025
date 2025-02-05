const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Avatar: { type: String, required: false },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
