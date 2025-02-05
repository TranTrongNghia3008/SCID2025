'use strict';

const ConversationSession = require('../models/conversationSessionModel'); // Import model
const Location = require('../models/locationModel');

const controller = {};

controller.show = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy ID người dùng từ req.user
        // Tìm kiếm các phiên trò chuyện của người dùng
        const conversations = await ConversationSession.find({ UserID: userId }).select('Title _id').sort({ updatedAt: -1 }); // Chọn Title và _id

        // Gửi dữ liệu tới view
        res.render('q-and-a', {
            user: req.user,
            title: "GeoSI - Q and A",
            d1: "selected-menu-item",
            conversations // Gửi danh sách phiên trò chuyện tới view
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
};

controller.getHistory = async (req, res) => {
    try {
        const id = req.params.id
        const conversation = await ConversationSession.findById(id);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        res.json(conversation.History);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

controller.createNewChat = async (req, res) => {
    try {
        const { UserID, Title, History } = req.body;
        // Tạo một cuộc hội thoại mới
        const newSession = new ConversationSession({
            UserID,
            Title,
            History,
        });

        // Lưu vào MongoDB
        const savedSession = await newSession.save();

        // Gửi phản hồi lại cho client
        res.status(201).json(savedSession);
    } catch (error) {
        console.error('Error creating new chat session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

controller.deleteConversation = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await ConversationSession.findByIdAndDelete(id);
        if (result) {
            res.status(200).json({ message: 'Conversation deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Conversation not found.' });
        }
    } catch (error) {
        console.error('Error deleting Conversation:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

controller.updateHistory = async (req, res) => {
    const { history } = req.body;
    const id = req.params.id;

    try {
        const conversation = await ConversationSession.findById(id);
        if (!conversation) {
            return res.status(404).send('Conversation not found');
        }

        // Cập nhật lịch sử hội thoại
        conversation.History.push(...history);
        await conversation.save();

        res.status(200).send('History updated successfully');
    } catch (error) {
        console.error('Error updating history:', error);
        res.status(500).send('Internal Server Error');
    }
};

controller.updateLocations = async (req, res) => {
    try {
        const { locations } = req.body;
        const sessionID = req.params.id;
        console.log(sessionID)

        // Xóa tất cả locations cũ có SessionID là conversationId
        await Location.deleteMany({ SessionID: sessionID });

        // Thêm mới các locations
        const newLocations = locations.map(loc => ({
            SessionID: sessionID,
            administrative_area: loc.administrative_area,
            country: loc.country,
            continent: loc.continent,
            lat: loc.lat,
            lon: loc.lon,
            links: loc.links,
            summaries: loc.summaries,
            sentiment: loc.sentiment
        }));

        await Location.insertMany(newLocations);

        res.status(200).json({ message: 'Locations updated successfully' });
    } catch (error) {
        console.error('Error updating locations:', error);
        res.status(500).json({ message: 'Failed to update locations', error: error.message });
    }
};

controller.loadLocations = async (req, res) => {
    const conversationId = req.params.id;

    try {
        // Tìm tất cả các location có SessionID khớp với conversationId
        const locations = await Location.find({ SessionID: conversationId });

        // Nếu không có location nào tìm thấy
        if (!locations.length) {
            return res.status(404).json({ message: 'No locations found for this conversation ID' });
        }

        // Trả về danh sách locations
        res.status(200).json({ locations });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ message: 'Error fetching locations', error: error.message });
    }
}

controller.renameConversation = async (req, res) => {
    const id = req.params.id;
    const { title } = req.body;

    console.log(id, title)

    try {
        await ConversationSession.updateOne({ _id: id }, { $set: { Title: title } });
        res.status(200).send({ message: 'Title updated successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error updating title' });
    }
}

module.exports = controller;
