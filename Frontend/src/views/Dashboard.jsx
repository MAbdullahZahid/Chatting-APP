import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // adjust path accordingly

const Dashboard = () => {
  const { socket, userId } = useAuth();  // get socket and userId from context

  const [phoneNumber, setPhoneNumber] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) {
        console.log("socket not found");
        
        return;}

    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket]);

  const handleSend = () => {
    if (!phoneNumber.trim() || !messageText.trim()) {
      alert("Please enter both phone number and message");
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
   <div
      style={{
        padding: "30px",
        maxWidth: "400px",
        margin: "auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Welcome to your chats</h1>

      <input
        type="text"
        placeholder="Enter phone number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />

      <textarea
        placeholder="Enter message"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        rows={4}
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          fontSize: "16px",
          resize: "none",
        }}
      />

      <button
        onClick={handleSend}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          marginBottom: "20px",
        }}
      >
        Send
      </button>

      <div
        style={{
          borderTop: "1px solid #ccc",
          paddingTop: "15px",
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        <h3>Messages</h3>
        {messages.length === 0 && <p>No messages yet.</p>}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: "10px",
              padding: "8px",
              backgroundColor: "#f1f1f1",
              borderRadius: "5px",
            }}
          >
            <strong>From: {msg.from}</strong>
            <p>{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
