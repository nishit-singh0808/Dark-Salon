import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "http://127.0.0.1:5000";
  // upload
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // 👈 NAME MUST BE "file"

    try {
      const res = await axios.post(
        `${BACKEND_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("UPLOAD RESPONSE:", res.data);
      alert("Upload successful");

    } catch (err) {
      console.error("UPLOAD ERROR:", err.response || err);
      alert("Upload failed");
    }
  };

  // Ask Question
  const handleAsk = async () => {
    if (!question) {
      alert("Please enter a question");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/chat`, {
        question,
      });

      setAnswer(res.data.answer || "No answer received");
    } catch (err) {
      console.error(err);
      setAnswer("Error while getting answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h2>📄 AI Document Chat (RAG)</h2>

      {/* Upload Section */}
      <div style={{ marginBottom: "30px" }}>
        <h3>Upload PDF</h3>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br /><br />
        <button onClick={handleUpload}>Upload</button>
      </div>

      {/* Chat Section */}
      <div>
        <h3>Ask Question</h3>
        <input
          type="text"
          placeholder="Ask something from the document..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ width: "400px", padding: "8px" }}
        />
        <br /><br />
        <button onClick={handleAsk}>Ask</button>
      </div>

      {/* Loading */}
      {loading && <p>⏳ Processing...</p>}

      {/* Answer */}
      {answer && (
        <div style={{ marginTop: "30px" }}>
          <h3>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default App;
