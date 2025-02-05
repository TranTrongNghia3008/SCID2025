const mongoose = require('mongoose');

const conversationSessionSchema = new mongoose.Schema({
  UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Title: { type: String, required: true},
  History: {
    type: [String] // Mảng các chuỗi để lưu lịch sử hội thoại
  }
}, { timestamps: true });

const ConversationSession = mongoose.model('ConversationSession', conversationSessionSchema);

module.exports = ConversationSession;
