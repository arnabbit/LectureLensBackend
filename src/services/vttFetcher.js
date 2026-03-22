const fetch = require('node-fetch');

async function fetchAll(lectures) {
  const results = await Promise.all(
    lectures.map(async (lecture) => {
      const { lectureId, captionUrl } = lecture;

      if (!captionUrl) {
        return { lectureId, vttText: null };
      }

      try {
        const response = await fetch(captionUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for lectureId ${lectureId}`);
        }
        const vttText = await response.text();
        console.log(`[vttFetcher] Fetched lectureId ${lectureId}: ${vttText.length} chars`);
        return { lectureId, vttText };
      } catch (err) {
        console.error(`[vttFetcher] Failed to fetch lectureId ${lectureId}:`, err.message);
        return { lectureId, vttText: null };
      }
    })
  );

  return results;
}

module.exports = { fetchAll };
