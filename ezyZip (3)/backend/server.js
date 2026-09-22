require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cosineSimilarity = require("./rag/similarity");
const Document = require("./models/documents");
const uploadRoute = require("./Routes/upload");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// UPLOAD ROUTE
app.use("/upload", uploadRoute);

async function getEmbedding(text) {
  const res = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "nomic-embed-text",
      prompt: text
    })
  });

  const data = await res.json();
  return data.embedding;
}

// CHAT API (ollama LLM)
app.post("/chat", async (req, res) => {
  try {
    const question = req.body.question;

    // 1️⃣ Question → embedding
    const questionEmbedding = await getEmbedding(question);

    // 2️⃣ Retrieve best document using cosine similarity (R)
    const docs = await Document.find();
    let bestDoc = null;
    let bestScore = -1;

    for (let doc of docs) {
      if (!doc.embedding || doc.embedding.length === 0) continue;

      const score = cosineSimilarity(questionEmbedding, doc.embedding);
      if (score > bestScore) {
        bestScore = score;
        bestDoc = doc;
      }
    }

    if (!bestDoc) {
      return res.json({ answer: "No relevant document found." });
    }

    // 3️⃣ Augment + Generate (AG)
    const prompt = `
Answer ONLY using the context below.

Context:
${bestDoc.text}

Question:
${question}

Answer:
`;

    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral:7b-instruct-q4_0",
        prompt,
        stream: false
      })
    });

    const data = await ollamaRes.json();
    res.json({ answer: data.response.trim() });


  } catch (err) {
    console.error("RAG ERROR:", err);
    res.status(500).json({ error: "RAG chat failed" });
  }
});

// MongoDB + SERVER START
mongoose
  .connect("mongodb://127.0.0.1:27017/ai-support")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, "127.0.0.1", () => {
      console.log("✅ Server running on http://127.0.0.1:5000");
    });
  })
  .catch((err) => console.error("MongoDB error:", err));