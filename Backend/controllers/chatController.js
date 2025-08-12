// controllers/chatControllers.js
const { Chat, User } = require("../model/schema");

exports.getUserContacts = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    });

    const ids = [...new Set(
      chats.map(c => c.senderId.toString() === userId ? c.receiverId : c.senderId)
    )];

    const contacts = await User.find({ _id: { $in: ids } }, "phoneNo");

    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
