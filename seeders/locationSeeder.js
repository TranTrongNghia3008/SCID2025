const fs = require('fs');
const mongoose = require('mongoose');
const location = require('../models/locationModel');

// Đường dẫn đến file JSON chứa dữ liệu mẫu
const locationDataPath = './sample-data/locations.json';

async function seedLocations() {
  try {
    // Đọc dữ liệu từ file JSON
    const rawData = fs.readFileSync(locationDataPath);
    const locationData = JSON.parse(rawData);

    // await location.deleteMany({});
    await location.insertMany(locationData);

    console.log('Sample data for the "Location" table has been created successfully.');
    // mongoose.connection.close();
  } catch (error) {
    console.error('Error creating sample data for table "Location":', error);
  }
}

module.exports = seedLocations;

// seedlocations();