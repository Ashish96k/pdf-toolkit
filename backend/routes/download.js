const path = require('path');
const fs = require('fs');
const express = require('express');

const router = express.Router();
const uploadsDir = path.join(__dirname, '..', 'uploads');

router.get('/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename || filename === '.' || filename === '..') {
    res.status(400).json({ error: 'Invalid filename' });
    return;
  }

  const filepath = path.join(uploadsDir, filename);
  if (!filepath.startsWith(uploadsDir)) {
    res.status(400).json({ error: 'Invalid filename' });
    return;
  }

  fs.access(filepath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
      return;
    }
    res.download(filepath, filename, (downloadErr) => {
      if (downloadErr && !res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    });
  });
});

module.exports = router;
