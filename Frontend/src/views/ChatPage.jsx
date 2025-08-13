import React, { useEffect, useState , useRef} from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";

const ChatPage = () => {
  const { socket, userId } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [chatPartner, setChatPartner] = useState("");
  const [isRecording, setIsRecording] = useState(false);
const mediaRecorderRef = useRef(null);
const chunksRef = useRef([]);

const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorderRef.current = new MediaRecorder(stream);
  chunksRef.current = [];

  mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);

  mediaRecorderRef.current.onstop = () => {
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result.split(",")[1];
      socket.emit("sendVoiceMessage", { chatId, senderId: userId, voiceMessage: base64Audio });
    };
    reader.readAsDataURL(blob);
  };

  mediaRecorderRef.current.start();
  setIsRecording(true);
};

const handleDeleteMessage = (messageId) => {
  Swal.fire({
    title: "Are you sure?",
    text: "This will delete your message for everyone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      socket.emit("deleteMessage", { messageId, chatId });
    }
  });
};


const stopRecording = () => {
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }
};

useEffect(() => {
  if (!socket) return;

  const handleVM = (vm) => {
    if (vm.chatId === chatId) {
      setMessages((prev) => [...prev, vm]);
    }
  };

  socket.on("newVoiceMessage", handleVM);

  return () => {
    socket.off("newVoiceMessage", handleVM);
  };
}, [socket, chatId]);


useEffect(() => {
  if (!socket) return;

  const handleMessageDeleted = ({ messageId }) => {
    setMessages(prev => prev.filter(m => m._id !== messageId));
  };

  socket.on("messageDeleted", handleMessageDeleted);

  return () => socket.off("messageDeleted", handleMessageDeleted);
}, [socket]);



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





socket.emit("markMessagesRead", { chatId, userId });

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

{messages.map((msg, idx) => (
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
        position: "relative"
      }}
    >
      {msg.messageText}
      {msg.senderId === userId && (
        <span style={{ marginLeft: 5, fontSize: "12px" }}>
          {msg.isRead ? "✅✅" : "✅"}
        </span>
      )}
      {msg.voiceMessage && (
        <div>
          <audio controls src={`data:audio/webm;base64,${msg.voiceMessage}`} />
        </div>
      )}

      {/* Delete button only for user's own message */}
      {msg.senderId === userId && (
        <button
          onClick={() => handleDeleteMessage(msg._id)}
          style={{
            marginLeft: "8px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
            padding: "2px 5px",
            fontSize: "10px",
            position: "absolute",
            top: "-5px",
            right: "-5px"
          }}
        >
          Delete
        </button>
      )}
    </span>
  </div>
))}


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
      <button onClick={isRecording ? stopRecording : startRecording}>
  {isRecording ? "Stop Recording" : "Record Voice"}
</button>

      <button onClick={handleSend}>Send Message</button>
    </div>
  );
};

export default ChatPage;