import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const ChatPage = () => {
  const { socket, userId } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [chatPartner, setChatPartner] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chatIdFromUrl = params.get("chatId");
    setChatId(chatIdFromUrl);

    if (chatIdFromUrl) {
      axios
        .get("http://localhost:3000/api/messages/chat-by-chatid", {
          params: { chatId: chatIdFromUrl },
        })
        .then((res) => {
          console.log("Messages from backend:", res.data);
          setMessages(res.data);

        
          if (res.data.length > 0) {
            const otherMsg = res.data.find((m) => m.senderId !== userId);
            if (otherMsg) {
              setChatPartner(otherMsg.senderName);
            } else {
              setChatPartner(res.data[0].senderName);
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching chat:", err);
        });
    }

    socket?.on("newMessage", (newMessage) => {
      if (newMessage.chatId === chatIdFromUrl) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

socket?.on("messagesRead", ({ chatId: updatedChatId }) => {
  if (updatedChatId === chatIdFromUrl) {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.senderId === userId ? { ...msg, isRead: true } : msg
      )
    );
  }
});


    return () => {
      socket?.off("newMessage");
      socket?.off("messagesRead");
    };
  }, [socket, userId]);


  useEffect(() => {
  if (socket && chatId && userId) {
    socket.emit("markMessagesRead", { chatId, userId });
  }
}, [socket, chatId, userId, messages]);





  const handleSend = () => {
    if (!messageText.trim()) return alert("Please enter a message");
    if (!chatId) return alert("Chat ID is missing");

    socket.emit("sendMessage", {
      chatId,
      messageText,
      senderId: userId,
    });

    setMessageText("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Chat with {chatPartner || "..."}</h2>

      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        // messages.map((msg, idx) => (
        //   <div
        //     key={idx}
        //     style={{
        //       textAlign: msg.senderId === userId ? "right" : "left",
        //       margin: "5px 0",
        //     }}
        //   >
        //     <span
        //       style={{
        //         backgroundColor: msg.senderId === userId ? "#DCF8C6" : "#EAEAEA",
        //         padding: "8px",
        //         borderRadius: "5px",
        //         display: "inline-block",
        //       }}
        //     >
        //       {msg.messageText}
        //     </span>
        //   </div>
        // ))
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
      {msg.senderId === userId && (
        <span style={{ marginLeft: 5, fontSize: "12px" }}>
          {msg.isRead ? "✅✅" : "✅"}
        </span>
      )}
    </span>
  </div>
))
      )}

      <input
        type="text"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder="Type your message..."
        onKeyDown={(e) => {
    if (e.key === "Enter" && messageText.trim() !== "") {
      handleSend();
    }
  }}
      />
      <button onClick={handleSend}>Send Message</button>
    </div>
  );
};

export default ChatPage;
