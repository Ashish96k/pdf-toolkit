const path = require('path');
const fs = require('fs');
const express = require('express');
const { deleteOutputFile } = require('../utils/cleanup');

const { uploadsDir } = require('../config');

const router = express.Router();

/**
 * @param {string} rawFilename
 * @returns {{ filename: string; filepath: string } | null}
 */
function resolveDownloadPath(rawFilename) {
  const filename = path.basename(rawFilename);
  if (!filename || filename === '.' || filename === '..') {
    return null;
  }

  const filepath = path.join(uploadsDir, filename);
  if (!filepath.startsWith(uploadsDir)) {
    return null;
  }

  return { filename, filepath };
}

router.get('/:filename', (req, res) => {
  const resolved = resolveDownloadPath(req.params.filename);
  if (!resolved) {
    res.status(400).json({ error: 'Invalid filename' });
    return;
  }

  const { filename, filepath } = resolved;

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

router.delete('/:filename', async (req, res) => {
  const resolved = resolveDownloadPath(req.params.filename);
  if (!resolved) {
    res.status(400).json({ error: 'Invalid filename' });
    return;
  }

  try {
    await deleteOutputFile(resolved.filepath);
    res.status(204).send();
  } catch (err) {
    console.error('[download] cleanup failed', err);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

module.exports = router;
