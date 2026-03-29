require('dotenv').config();

const express = require('express');
const cors = require('cors');

const mergeRouter = require('./routes/merge');
const splitRouter = require('./routes/split');
const compressRouter = require('./routes/compress');
const pdfToWordRouter = require('./routes/pdfToWord');
const downloadRouter = require('./routes/download');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/merge', mergeRouter);
app.use('/api/split', splitRouter);
app.use('/api/compress', compressRouter);
app.use('/api/pdf-to-word', pdfToWordRouter);
app.use('/api/download', downloadRouter);

app.use((err, _req, res, _next) => {
  if (err && err.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large'
        : err.message || 'Upload error';
    res.status(400).json({ error: message });
    return;
  }

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ error: message });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
