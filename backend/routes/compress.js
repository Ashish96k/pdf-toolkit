const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { upload } = require('../middleware/upload');
const { deleteAfterDelay } = require('../utils/cleanup');

const execAsync = util.promisify(exec);

const { uploadsDir } = require('../config');

const router = express.Router();

/** Ghostscript -dPDFSETTINGS values */
const LEVEL_TO_SETTINGS = {
  low: '/printer',
  medium: '/ebook',
  high: '/screen',
};

/**
 * @param {string} arg
 */
function shellQuote(arg) {
  const s = String(arg);
  if (/^[\w@%+=:,./-]+$/i.test(s)) return s;
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

router.post('/', upload.single('file'), async (req, res, next) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No PDF file provided (field name: file)' });
    return;
  }

  const level = String(req.body?.level ?? '').toLowerCase();
  const pdfSettings = LEVEL_TO_SETTINGS[level];
  if (!pdfSettings) {
    await fs.unlink(file.path).catch(() => {});
    res.status(400).json({ error: 'Invalid level. Use low, medium, or high.' });
    return;
  }

  const inPath = file.path;
  const outName = `${uuidv4()}.pdf`;
  const outPath = path.join(uploadsDir, outName);

  try {
    const cmd = [
      'gs',
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      `-dPDFSETTINGS=${pdfSettings}`,
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile=${shellQuote(outPath)}`,
      shellQuote(inPath),
    ].join(' ');

    await execAsync(cmd, { maxBuffer: 20 * 1024 * 1024 });

    const outStat = await fs.stat(outPath);
    const originalSize = typeof file.size === 'number' ? file.size : (await fs.stat(inPath)).size;
    const compressedSize = outStat.size;

    await fs.unlink(inPath).catch(() => {});

    deleteAfterDelay(outPath);

    res.json({
      downloadUrl: `/api/download/${outName}`,
      originalSize,
      compressedSize,
    });
  } catch (err) {
    await fs.unlink(outPath).catch(() => {});
    await fs.unlink(inPath).catch(() => {});
    const message = err?.message || 'Compression failed';
    const wrapped = new Error(
      /not found|ENOENT|spawn/i.test(message)
        ? 'Ghostscript (gs) is not available on the server. Install it to enable PDF compression.'
        : message
    );
    wrapped.status = 500;
    next(wrapped);
  }
});

module.exports = router;
