const path = require('path');
const fs = require('fs').promises;
const express = require('express');
const { PDFDocument } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');
const { upload } = require('../middleware/upload');
const { deleteAfterDelay } = require('../utils/cleanup');

const { uploadsDir } = require('../config');

const router = express.Router();

router.post('/', upload.array('files', 20), async (req, res, next) => {
  const files = req.files;
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No PDF files provided (field name: files)' });
    return;
  }

  try {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const bytes = await fs.readFile(file.path);
      const pdf = await PDFDocument.load(bytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const outName = `${uuidv4()}.pdf`;
    const outPath = path.join(uploadsDir, outName);
    const mergedBytes = await mergedPdf.save();
    await fs.writeFile(outPath, mergedBytes);

    await Promise.all(
      files.map((f) =>
        fs.unlink(f.path).catch(() => {
          /* ignore */
        })
      )
    );

    deleteAfterDelay(outPath);

    res.json({ downloadUrl: `/api/download/${outName}` });
  } catch (err) {
    await Promise.all(
      (files || []).map((f) =>
        fs.unlink(f.path).catch(() => {
          /* ignore */
        })
      )
    );
    next(err);
  }
});

module.exports = router;
