const mongoose = require('mongoose');

const articleFileSchema = new mongoose.Schema({
  SessionID: { type: mongoose.Schema.Types.ObjectId, ref: 'ConversationSession', required: true  },
  Link: {
    type: String,
    required: true
  },
  PDFfile: {
    type: String, // Lưu đường dẫn hoặc URL của file PDF
    required: true
  }
}, { timestamps: true });

const ArticleFile = mongoose.model('ArticleFile', articleFileSchema);

module.exports = ArticleFile;
