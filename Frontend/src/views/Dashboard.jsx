import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; 
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
  const { logout } = useAuth();

 

const [filterText, setFilterText] = useState("");
const [allContacts, setallContacts] = useState("");

const filteredContacts = Array.isArray(allContacts)
  ? allContacts.filter(contact =>
      contact.phoneNo && contact.phoneNo.toLowerCase().includes(filterText.toLowerCase())
    )
  : [];




useEffect(() => {
  if (!userId) return;

 
   axios.get(`http://localhost:3000/api/contacts/${userId}`)

    .then((res) => {
       console.log("Backend raw All Contacts response:", res.data);
   
      if (Array.isArray(res.data)) {
        setallContacts(res.data);
      } else {
        setallContacts([]);
      }
    })
    .catch((err) => {
      console.error("Error fetching contacts:", err);
      setallContacts([]);
    });
}, [userId]);


useEffect(() => {
  if (!userId) return;

  axios
    .get(`http://localhost:3000/api/chats/contacts/${userId}`)
    .then((res) => {
       console.log("Backend raw response:", res.data);
   
      if (Array.isArray(res.data)) {
        console.log("Conatcts: " , res.data)
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
  

 const handleContactClick = (chatId) => {
  console.log("ChatID", chatId)
  navigate(`/user/chat?chatId=${encodeURIComponent(chatId)}`);
};

 const handleLogout = () => {
    logout();              
    navigate("/auth/login");
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
      onClick={handleLogout}
      style={{
        padding: "8px 15px",
        marginBottom: "15px",
        marginRight: "10px",
        backgroundColor: "#4CAF50",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Logout
    </button>


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
       
        <div style={{ marginTop: "20px" }}>
  <input
    type="text"
    placeholder="Search contacts..."
    value={filterText}
    onChange={(e) => setFilterText(e.target.value)}
    style={{
      padding: "8px",
      width: "100%",
      marginBottom: "10px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      fontSize: "16px",
    }}
  />
  
  {filteredContacts.length > 0 ? (
  filteredContacts.map((contact, idx) => (
    <div
      key={idx}
      onClick={() => handleContactClick(contact.chatId)}
      style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ccc" }}
    >
      <strong>{contact.phoneNo}</strong>  {/* contact is an object, show phoneNo */}
    </div>
  ))
) : (
  <p>No contact found.</p>
)}


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
      <strong>{contact.name}</strong>
      <br />
      <strong>{contact.phoneNo}</strong>  {/* display phone number */}
    </div>
  ))
)}
</div>

    
    </div>
  );
};

export default Dashboard;