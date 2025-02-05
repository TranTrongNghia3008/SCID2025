const fs = require('fs');
const mongoose = require('mongoose');
const conversationSession = require('../models/conversationSessionModel');

// Đường dẫn đến file JSON chứa dữ liệu mẫu
const conversationSessionDataPath = './sample-data/conversationSesstions.json';

async function seedConversationSessions() {
  try {
    // Đọc dữ liệu từ file JSON
    const rawData = fs.readFileSync(conversationSessionDataPath);
    const conversationSessionData = JSON.parse(rawData);

    await conversationSession.deleteMany({});
    await conversationSession.insertMany(conversationSessionData);

    console.log('Sample data for the "ConversationSession" table has been created successfully.');
    // mongoose.connection.close();
  } catch (error) {
    console.error('Error creating sample data for table "ConversationSession":', error);
  }
}

module.exports = seedConversationSessions;
