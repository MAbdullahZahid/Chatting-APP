import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000"); // Connect to your backend socket.io server

const ChatPage = () => {
  const { userId } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState("");
  const [messageText, setMessageText] = useState("");
  

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chatIdFromUrl = params.get("chatId");
    setChatId(chatIdFromUrl);

    if (chatIdFromUrl) {
      axios
        .get("http://localhost:3000/api/messages/chat-by-chatid", {
          params: {
            chatId: chatIdFromUrl,
          },
        })
        .then((res) => {
          setMessages(res.data);
        })
        .catch((err) => {
          console.error("Error fetching chat:", err);
        });
    }

    // Listen to new incoming messages via socket (optional)
   socket.on("newMessage", (newMessage) => {
  if (newMessage.chatId === chatIdFromUrl) {
    setMessages((prev) => [...prev, newMessage]);
  }
});


    return () => {
      socket.off("newMessage");
    };
  }, []);

  useEffect(() => {
  // Request notification permission on component mount
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  socket.on("newMessage", (newMessage) => {
    if (newMessage.chatId === chatId) {
      setMessages((prev) => [...prev, newMessage]);

      // Show desktop notification
      if (Notification.permission === "granted" && newMessage.senderId !== userId) {
        new Notification(`New message from ${newMessage.senderUsername}`, {
          body: newMessage.messageText,
          icon: "/chat-icon.png",  // optional: your app icon url
        });
      }
    }
  });

  return () => {
    socket.off("newMessage");
  };
}, [chatId, userId]);

  const handleSend = () => {
    if (!messageText.trim()) {
      alert("Please enter a message");
      return;
    }

    if (!chatId) {
      alert("Chat ID is missing");
      return;
    }

    socket.emit("sendMessage", {
      chatId,
      messageText,
       senderId: userId,  
    });

    setMessageText("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Chat</h2>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.senderId === userId ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <span
              style={{
                backgroundColor: msg.senderId === userId ? "#DCF8C6" : "#EAEAEA",
                padding: "8px",
                borderRadius: "5px",
                display: "inline-block",
              }}
            >
              {msg.messageText}
            </span>
          </div>
        ))
      )}
      <input
        type="text"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSend}>Send Message</button>
    </div>
  );
};

export default ChatPage;
