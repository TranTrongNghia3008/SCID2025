const fs = require('fs');
const mongoose = require('mongoose');
const articleFile = require('../models/articleFileModel');

// Đường dẫn đến file JSON chứa dữ liệu mẫu
const articleFileDataPath = './sample-data/articleFiles.json';

async function seedArticleFiles() {
  try {
    // Đọc dữ liệu từ file JSON
    const rawData = fs.readFileSync(articleFileDataPath);
    const articleFileData = JSON.parse(rawData);

    // await articleFile.deleteMany({});
    await articleFile.insertMany(articleFileData);

    console.log('Sample data for the "ArticleFile" table has been created successfully.');
    // mongoose.connection.close();
  } catch (error) {
    console.error('Error creating sample data for table "ArticleFile":', error);
  }
}

module.exports = seedArticleFiles;

// seedarticleFiles();