function chunk(text, maxTokens = 6000) {
  if (!text || text.trim() === '') return [];

  // Rough token estimate: chars / 4
  const maxChars = maxTokens * 4;

  // Split by sentence boundaries
  const sentences = text.split('. ');
  const chunks = [];
  let current = '';

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    // Re-add the period+space we split on (except for last segment)
    const piece = i < sentences.length - 1 ? sentence + '. ' : sentence;

    if (current.length + piece.length > maxChars) {
      if (current.trim() !== '') {
        chunks.push(current.trim());
      }
      // If a single sentence exceeds maxChars, push it as its own chunk
      if (piece.length > maxChars) {
        chunks.push(piece.trim());
        current = '';
      } else {
        current = piece;
      }
    } else {
      current += piece;
    }
  }

  if (current.trim() !== '') {
    chunks.push(current.trim());
  }

  return chunks;
}

module.exports = { chunk };
