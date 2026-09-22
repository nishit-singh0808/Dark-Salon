"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import AdminNavbar from "./admin-navbar";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

export default function QueryMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch messages
  const fetchMessages = async () => {
    setLoading(true);
    try {
      // 👇 use your collection name "message"
      const q = query(collection(db, "message"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const messagesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ✅ Delete message
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this message?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "message", id));
      setMessages(messages.filter((msg) => msg.id !== id));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: "20px" }}>
        <h1>User Queries</h1>
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p>No queries found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {messages.map((msg) => (
              <li
                key={msg.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "15px",
                  marginBottom: "10px",
                  background: "black",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p><strong>Name:</strong> {msg.name || "Anonymous"}</p>
                  <p><strong>Email:</strong> {msg.email || "No email"}</p>
                  <p><strong>Message:</strong> {msg.message || "No message text"}</p>
                  <p>
                    <strong>Sent At:</strong>{" "}
                    {msg.timestamp
                      ? new Date(msg.timestamp.seconds * 1000).toLocaleString()
                      : "No timestamp"}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(msg.id)}
                  style={{
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    height: "fit-content",
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
