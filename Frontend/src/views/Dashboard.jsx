import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // adjust path accordingly
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { socket, userId } = useAuth(); // get socket and userId from context
   const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);

 


useEffect(() => {
  if (!userId) return;

  axios
    .get(`http://localhost:3000/api/chats/contacts/${userId}`)
    .then((res) => {
       console.log("Backend raw response:", res.data);
   
      if (Array.isArray(res.data)) {
        setContacts(res.data);
      } else {
        setContacts([]);
      }
    })
    .catch((err) => {
      console.error("Error fetching contacts:", err);
      setContacts([]);
    });
}, [userId]);


  // Listen for incoming messages
  useEffect(() => {
    if (!socket) {
      console.log("socket not found");
      return;
    }

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

 const handleContactClick = (chatId) => {
  console.log("ChatID", chatId)
  navigate(`/user/chat?chatId=${encodeURIComponent(chatId)}`);
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

      {/* Contacts List */}
    


      <button
        onClick={() => {
          setShowNewChat((prev) => !prev);
        }}
        style={{
          padding: "8px 15px",
          marginBottom: "15px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        New Chat
      </button>

      {showNewChat && (
        <div>
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
              backgroundColor: "#2196F3",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      )}


<div>
  <h3>Your Chats</h3>
  {contacts.length === 0 ? (
  <p>No Chat yet.</p>
) : (
  contacts.map((contact, idx) => (
    <div
      key={idx}
      onClick={() => handleContactClick(contact.chatId)}  // use chatId here
      style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ccc" }}
    >
      <strong>{contact.phoneNo}</strong>  {/* display phone number */}
    </div>
  ))
)}
</div>

    
    </div>
  );
};

export default Dashboard;
