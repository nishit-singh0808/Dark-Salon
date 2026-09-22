const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  text: String,        // chunk text
  embedding: [Number], // embedding of chunk
});

module.exports = mongoose.model("Document", DocumentSchema);
