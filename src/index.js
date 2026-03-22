const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MONGO_URI, PORT } = require('./config');

const ingestRouter = require('./routes/ingest');
const processRouter = require('./routes/process');
const lecturesRouter = require('./routes/lectures');
const quizRouter = require('./routes/quiz');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/ingest', ingestRouter);
app.use('/process', processRouter);
app.use('/lectures', lecturesRouter);
app.use('/quiz', quizRouter);
// Rephrase route lives in quiz router under /rephrase/:problemId
app.use('/rephrase', quizRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[app] Unhandled error:', err.message);
  res.status(500).json({ error: err.message });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[app] Connected to MongoDB:', MONGO_URI);

    app.listen(PORT, () => {
      console.log(`[app] Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[app] Failed to start:', err.message);
    process.exit(1);
  }
}

start();
