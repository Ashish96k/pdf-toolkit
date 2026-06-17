const fs = require('fs').promises;
const express = require('express');
const { upload } = require('../middleware/upload');
const { scheduleOutputDeletion } = require('../utils/cleanup');
const {
  parseCompressionRequest,
  compressPdfFile,
} = require('../utils/compressPdf');

const router = express.Router();

router.post('/preview', upload.single('file'), async (req, res, next) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No PDF file provided (field name: file)' });
    return;
  }

  const request = parseCompressionRequest(req.body);
  if (!request) {
    await fs.unlink(file.path).catch(() => {});
    res.status(400).json({
      error:
        'Invalid compression options. Use level low, medium, high, or custom with strength 0–100.',
    });
    return;
  }

  const inPath = file.path;

  try {
    const { originalSize, compressedSize, outPath } = await compressPdfFile(
      inPath,
      request,
      file.size
    );

    await fs.unlink(inPath).catch(() => {});
    await fs.unlink(outPath).catch(() => {});

    res.json({ originalSize, compressedSize });
  } catch (err) {
    await fs.unlink(inPath).catch(() => {});
    next(err);
  }
});

router.post('/', upload.single('file'), async (req, res, next) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No PDF file provided (field name: file)' });
    return;
  }

  const request = parseCompressionRequest(req.body);
  if (!request) {
    await fs.unlink(file.path).catch(() => {});
    res.status(400).json({
      error:
        'Invalid compression options. Use level low, medium, high, or custom with strength 0–100.',
    });
    return;
  }

  const inPath = file.path;

  try {
    const { originalSize, compressedSize, outPath, outName } =
      await compressPdfFile(inPath, request, file.size);

    await fs.unlink(inPath).catch(() => {});

    scheduleOutputDeletion(outPath);

    res.json({
      downloadUrl: `/api/download/${outName}`,
      originalSize,
      compressedSize,
    });
  } catch (err) {
    await fs.unlink(inPath).catch(() => {});
    next(err);
  }
});

module.exports = router;
