// server/src/utils/pdf.js

/**
 * Split `text` into chunks of at most maxLen characters.
 * (Adjust maxLen to suit your model’s context window.)
 */
function chunkText(text, maxLen = 2000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLen) {
    chunks.push(text.slice(i, i + maxLen));
  }
  return chunks;
}

module.exports = { chunkText };
