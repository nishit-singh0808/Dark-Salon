function chunkText(text) {
  return text
    .split(/\n?\d+\.\s+/)   // split by "1. ", "2. ", etc.
    .map(chunk => chunk.trim())
    .filter(chunk => chunk.length > 0);
}

module.exports = chunkText;

