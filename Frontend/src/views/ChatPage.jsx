import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
  const [messageText, setMessageText] = useState("");
const ChatPage = () => {
  const { userId } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chatIdFromUrl = params.get("chatId");
    setChatId(chatIdFromUrl);

    if (chatIdFromUrl) {
      axios
        .get("http://localhost:3000/api/messages/chat-by-chatid", {
          params: {
            chatId: chatIdFromUrl
          }
        })
        .then((res) => {
          console.log(res.data);
          setMessages(res.data);
        })
        .catch((err) => {
          console.error("Error fetching chat:", err);
        });
    }
  }, []);

  const handleSend = () => {
    if ( !messageText.trim()) {
      alert("Please enter message");
      return;
    }

    socket.emit("sendMessage", {
      senderId: userId,
      receiverPhone: phoneNumber,
      message: messageText,
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
      <input type="text" name="" id="" value={messageText}  onChange={(e) => setMessageText(e.target.value)} /> 
         
      <button onClick={handleSend}>Send Message</button>
    </div>
  );
};

export default ChatPage;
