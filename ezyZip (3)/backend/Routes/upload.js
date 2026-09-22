const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");

const Document = require("../models/documents");
const chunkText = require("../rag/chunker");

// 🔥 Ollama fetch
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 🔹 Ollama embedding function
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

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const chunks = chunkText(pdfData.text);
    let successCount = 0;

    for (let chunk of chunks) {
      const embedding = await getEmbedding(chunk);

      await new Document({
        text: chunk,
        embedding
      }).save();

      successCount++;
    }

    res.json({
      message: "Upload finished successfully",
      chunksSaved: successCount
    });

  } catch (error) {
    console.error("❌ Upload failed:", error);
    res.status(500).json({ error: "PDF processing failed" });
  }
});

module.exports = router;
