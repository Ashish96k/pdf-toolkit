const path = require('path');
const fs = require('fs').promises;
const express = require('express');
const archiver = require('archiver');
const { PDFDocument } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');
const { upload } = require('../middleware/upload');
const { deleteAfterDelay } = require('../utils/cleanup');

const { uploadsDir } = require('../config');

const router = express.Router();

/**
 * @param {string} rangeStr
 * @param {number} pageCount
 * @returns {number[]} 1-based page numbers in range order, unique (first occurrence)
 */
function parsePageRange(rangeStr, pageCount) {
  const s = String(rangeStr ?? '').trim();
  if (!s) {
    const err = new Error('Range is required for mode "range"');
    err.status = 400;
    throw err;
  }

  const parts = s.split(',');
  /** @type {number[]} */
  const ordered = [];
  const seen = new Set();

  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (!part) continue;

    if (part.includes('-')) {
      const [a, b] = part.split('-').map((x) => x.trim());
      const start = Number(a);
      const end = Number(b);
      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start < 1 ||
        end < 1 ||
        start > end
      ) {
        const err = new Error(`Invalid range segment: "${part}"`);
        err.status = 400;
        throw err;
      }
      for (let p = start; p <= end; p++) {
        if (!seen.has(p)) {
          seen.add(p);
          ordered.push(p);
        }
      }
    } else {
      const n = Number(part);
      if (!Number.isInteger(n) || n < 1) {
        const err = new Error(`Invalid page number: "${part}"`);
        err.status = 400;
        throw err;
      }
      if (!seen.has(n)) {
        seen.add(n);
        ordered.push(n);
      }
    }
  }

  if (ordered.length === 0) {
    const err = new Error('No valid pages in range');
    err.status = 400;
    throw err;
  }

  for (const p of ordered) {
    if (p > pageCount) {
      const err = new Error(
        `Page ${p} is out of range (document has ${pageCount} page${pageCount === 1 ? '' : 's'})`
      );
      err.status = 400;
      throw err;
    }
  }

  return ordered;
}

router.post('/', upload.single('file'), async (req, res, next) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No PDF file provided (field name: file)' });
    return;
  }

  const mode = req.body.mode;
  const rangeStr = req.body.range;

  if (mode !== 'all' && mode !== 'range') {
    await fs.unlink(file.path).catch(() => {});
    res.status(400).json({ error: 'Invalid mode; use "all" or "range"' });
    return;
  }

  if (mode === 'range' && (rangeStr == null || String(rangeStr).trim() === '')) {
    await fs.unlink(file.path).catch(() => {});
    res.status(400).json({ error: 'Range string is required when mode is "range"' });
    return;
  }

  try {
    const srcBytes = await fs.readFile(file.path);
    const srcPdf = await PDFDocument.load(srcBytes);
    const pageCount = srcPdf.getPageCount();

    if (pageCount === 0) {
      await fs.unlink(file.path).catch(() => {});
      res.status(400).json({ error: 'PDF has no pages' });
      return;
    }

    /** @type {number[]} */
    let oneBasedPages;
    if (mode === 'all') {
      oneBasedPages = Array.from({ length: pageCount }, (_, i) => i + 1);
    } else {
      oneBasedPages = parsePageRange(String(rangeStr), pageCount);
    }

    await fs.unlink(file.path).catch(() => {});

    if (oneBasedPages.length === 1) {
      const pageIndex = oneBasedPages[0] - 1;
      const outPdf = await PDFDocument.create();
      const [copied] = await outPdf.copyPages(srcPdf, [pageIndex]);
      outPdf.addPage(copied);
      const bytes = await outPdf.save();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="split.pdf"');
      res.send(Buffer.from(bytes));
      return;
    }

    /** @type {{ path: string; name: string }[]} */
    const outputs = [];

    for (const oneBased of oneBasedPages) {
      const pageIndex = oneBased - 1;
      const outPdf = await PDFDocument.create();
      const [copied] = await outPdf.copyPages(srcPdf, [pageIndex]);
      outPdf.addPage(copied);
      const bytes = await outPdf.save();
      const diskName = `${uuidv4()}.pdf`;
      const outPath = path.join(uploadsDir, diskName);
      await fs.writeFile(outPath, bytes);
      deleteAfterDelay(outPath);
      outputs.push({ path: outPath, name: `page-${oneBased}.pdf` });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="split-pages.zip"');

    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise((resolve, reject) => {
      archive.on('error', reject);
      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('[split/zip]', err);
          return;
        }
        reject(err);
      });
      archive.on('end', resolve);
      archive.pipe(res);

      for (const o of outputs) {
        archive.file(o.path, { name: o.name });
      }

      void archive.finalize();
    });
  } catch (err) {
    await fs.unlink(file.path).catch(() => {});
    next(err);
  }
});

module.exports = router;
