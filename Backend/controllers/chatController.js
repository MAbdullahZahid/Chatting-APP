// controllers/chatControllers.js
const { Chat, User } = require("../model/schema");

exports.getUserContacts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all chats where user is sender or receiver
    const chats = await Chat.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).populate('senderId', 'phoneNo').populate('receiverId', 'phoneNo');

    // For each chat, find the other user and prepare result with chatId and phoneNo
    const contacts = chats.map(chat => {
      const otherUser = chat.senderId._id.toString() === userId ? chat.receiverId : chat.senderId;
      return {
        chatId: chat._id.toString(),
        phoneNo: otherUser.phoneNo
      };
    });

    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
