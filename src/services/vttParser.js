// Matches VTT timestamp lines: 00:00:00.000 --> 00:00:00.000 (with optional position metadata)
const TIMESTAMP_RE = /^\d{2}:\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}\.\d{3}/;
// Matches pure numeric cue identifiers
const CUE_ID_RE = /^\d+$/;
// Matches WEBVTT header
const WEBVTT_RE = /^WEBVTT/;
// Matches NOTE block start
const NOTE_RE = /^NOTE\s*/;

function toPlainText(vttText) {
  if (!vttText) return '';

  const lines = vttText.split(/\r?\n/);
  const textLines = [];
  let inNoteBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines (used as cue separators in VTT)
    if (line === '') {
      inNoteBlock = false;
      continue;
    }

    // Skip WEBVTT header
    if (WEBVTT_RE.test(line)) continue;

    // Enter and skip NOTE blocks
    if (NOTE_RE.test(line)) {
      inNoteBlock = true;
      continue;
    }

    if (inNoteBlock) continue;

    // Skip timestamp lines
    if (TIMESTAMP_RE.test(line)) continue;

    // Skip pure numeric cue identifiers
    if (CUE_ID_RE.test(line)) continue;

    textLines.push(line);
  }

  // Deduplicate consecutive identical lines
  const deduped = [];
  for (let i = 0; i < textLines.length; i++) {
    if (i === 0 || textLines[i] !== textLines[i - 1]) {
      deduped.push(textLines[i]);
    }
  }

  return deduped.join(' ').trim();
}

module.exports = { toPlainText };
