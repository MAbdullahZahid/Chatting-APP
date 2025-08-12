const express = require("express");
const { User } = require("./model/schema");
const { Chat, Message } = require("./model/schema");
require("dotenv").config();
const connectDB = require("./dbconnection/dbConnection");
const { createAllSchemas } = require("./model/schema");
const cors = require("cors");

const signupRoutes = require("./routes/signupRoute");
const loginRoutes = require("./routes/loginRoute");
const chatRoutes = require("./routes/chatRoutes");
const allContacts = require("./routes/allContactsRoutes");




const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Chatting APP");
});

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // replace "*" with your frontend URL in production
    methods: ["GET", "POST"],
  },
});

const connectedUsers = [];

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("userJoined", async (userId) => {
    try {
      const user = await User.findById(userId).select("username phoneNo");
      if (!user) {
        console.log(`User with ID ${userId} not found`);
        return;
      }

      const username = user.username || "Unknown";
      const phoneNo = user.phoneNo || null;

      console.log(`${username} joined (socket: ${socket.id})`);

      const existingIndex = connectedUsers.findIndex(u => u.userId === userId);
      if (existingIndex !== -1) {
        connectedUsers[existingIndex].socketId = socket.id;
      } else {
        connectedUsers.push({
          userId,
          phoneNo,
          socketId: socket.id,
          username,
        });
      }

      io.emit("broadcast", { message: `${username} has joined` });

      console.log("Connected users:", connectedUsers);
    } catch (error) {
      console.error("Error in userJoined:", error);
    }
  });



socket.on("sendMessage", async ({ chatId, messageText, senderId }) => {
  try {
    if (!chatId || !messageText || !senderId) {
      socket.emit("error", { message: "chatId, messageText, and senderId are required" });
      return;
    }

    // Find chat
    const chat = await Chat.findById(chatId);

    if (!chat) {
      socket.emit("error", { message: "Chat not found" });
      return;
    }

    // Optional: Check sender is part of this chat
    if (![chat.senderId.toString(), chat.receiverId.toString()].includes(senderId)) {
      socket.emit("error", { message: "Sender not part of this chat" });
      return;
    }

    // Create new message with the actual sender
    const newMessage = await Message.create({
      chatId,
      senderId,
      messageText,
    });

    // Update chat
    chat.messageId = newMessage._id;
    chat.chatTime = new Date();
    await chat.save();

    // Get sender's username for notification
    const sender = await User.findById(senderId).select("username");

    io.emit("newMessage", {
      _id: newMessage._id,
      chatId,
      senderId,
      senderUsername: sender.username,
      messageText,
      createdAt: newMessage.createdAt,
    });

  } catch (error) {
    console.error("Error in sendMessage:", error);
    socket.emit("error", { message: "Failed to send message" });
  }
});


  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});





server.listen(5000, () => {
  console.log("WebSocket server running on port 5000");
});

app.listen(3000, () => {
  console.log("HTTP server running on port 3000");
});

connectDB();
createAllSchemas();

app.use("/api", signupRoutes);
app.use("/api", loginRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api", allContacts);
app.use("/api/messages", require("./routes/messageRoutes"));

