const fs = require('fs');
const mongoose = require('mongoose');
const User = require('../models/userModel');

// Đường dẫn đến file JSON chứa dữ liệu mẫu
const userDataPath = './sample-data/users.json';

async function seedUsers() {
  try {
    // Đọc dữ liệu từ file JSON
    const rawData = fs.readFileSync(userDataPath);
    const userData = JSON.parse(rawData);

    await User.deleteMany({});
    await User.insertMany(userData);

    console.log('Sample data for the "User" table has been created successfully.');
    // mongoose.connection.close();
  } catch (error) {
    console.error('Error creating sample data for table "User":', error);
  }
}

module.exports = seedUsers;

// seedUsers();