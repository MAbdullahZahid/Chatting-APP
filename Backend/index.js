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

  // socket.on("sendMessage", async ({ senderId, receiverPhone, message }) => {
  //   try {
  //     console.log("gotten date", senderId, "receiverPhone", receiverPhone, "message", message)
  //     const sender = await User.findById(senderId).select("username");
  //     const receiver = await User.findOne({ phoneNo: receiverPhone }).select("_id username");

  //     if (!receiver) {
  //       socket.emit("error", { message: "Receiver not found" });
  //       return;
  //     }





  //     const user = connectedUsers.find(u => u.userId === receiver._id.toString());
  //     if (user) {
  //       io.to(user.socketId).emit("receiveMessage", {
  //         from: sender ? sender.username : "Unknown",
  //         message,
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error in sendMessage:", error);
  //   }
  // });
socket.on("sendMessage", async ({ senderId, receiverPhone, message }) => {
  try {
    console.log("Received message request:", senderId, receiverPhone, message);

    const sender = await User.findById(senderId).select("username");
    const receiver = await User.findOne({ phoneNo: receiverPhone }).select("_id username");

    if (!receiver) {
      socket.emit("error", { message: "Receiver not found" });
      return;
    }

    // 1. Find or create chat between sender and receiver
    let chat = await Chat.findOne({
      $or: [
        { senderId, receiverId: receiver._id },
        { senderId: receiver._id, receiverId: senderId }
      ]
    });

    if (!chat) {
      chat = await Chat.create({
        senderId,
        receiverId: receiver._id
      });
    }

    // 2. Create message
    const newMessage = await Message.create({
      chatId: chat._id,
      senderId,
      messageText: message
    });

    // 3. Update chat with last message reference (optional)
    chat.messageId = newMessage._id;
    await chat.save();

    console.log("Message stored in DB:", newMessage);

  } catch (error) {
    console.error("Error in sendMessage:", error);
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

