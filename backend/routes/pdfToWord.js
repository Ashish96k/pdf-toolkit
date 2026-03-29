const path = require('path');
const fs = require('fs').promises;
const { execFile } = require('child_process');
const util = require('util');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { upload } = require('../middleware/upload');
const { deleteAfterDelay } = require('../utils/cleanup');

const execFileAsync = util.promisify(execFile);

const { uploadsDir } = require('../config');

const router = express.Router();

/** @type {string | null} */
let libreOfficeCmd = null;
let pdf2docxAvailable = false;

async function probeCapabilities() {
  const loCandidates = ['libreoffice', 'soffice'];
  for (const cmd of loCandidates) {
    try {
      await execFileAsync(cmd, ['--version'], {
        timeout: 20_000,
        maxBuffer: 1024 * 1024,
      });
      libreOfficeCmd = cmd;
      break;
    } catch {
      /* try next */
    }
  }

  try {
    await execFileAsync('python3', ['-c', 'import pdf2docx'], {
      timeout: 20_000,
      maxBuffer: 1024 * 1024,
    });
    pdf2docxAvailable = true;
  } catch {
    pdf2docxAvailable = false;
  }

  console.log('[pdf-to-word] LibreOffice:', libreOfficeCmd || 'unavailable', '| pdf2docx:', pdf2docxAvailable);
}

const probePromise = probeCapabilities();

/**
 * @param {string} inPdfPath
 * @param {string} finalDocxPath
 */
async function convertWithLibreOffice(inPdfPath, finalDocxPath) {
  if (!libreOfficeCmd) {
    throw new Error('LibreOffice not available');
  }

  await execFileAsync(
    libreOfficeCmd,
    ['--headless', '--convert-to', 'docx', '--outdir', uploadsDir, inPdfPath],
    {
      maxBuffer: 50 * 1024 * 1024,
      timeout: 180_000,
    }
  );

  const base = path.basename(inPdfPath, path.extname(inPdfPath));
  const produced = path.join(uploadsDir, `${base}.docx`);
  await fs.rename(produced, finalDocxPath);
}

/**
 * @param {string} inPdfPath
 * @param {string} outDocxPath
 */
async function convertWithPdf2docx(inPdfPath, outDocxPath) {
  const script = `from pdf2docx import Converter
c = Converter(${JSON.stringify(inPdfPath)})
c.convert(${JSON.stringify(outDocxPath)})
c.close()`;

  await execFileAsync('python3', ['-c', script], {
    maxBuffer: 50 * 1024 * 1024,
    timeout: 180_000,
  });
}

router.post('/', upload.single('file'), async (req, res, next) => {
  await probePromise.catch(() => {});

  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No PDF file provided (field name: file)' });
    return;
  }

  if (!libreOfficeCmd && !pdf2docxAvailable) {
    await fs.unlink(file.path).catch(() => {});
    res.status(503).json({
      error:
        'PDF to Word is not configured on this server. Install LibreOffice or Python pdf2docx (pip install pdf2docx).',
    });
    return;
  }

  const inPath = file.path;
  const workPdfPath = path.join(uploadsDir, `${uuidv4()}.pdf`);
  const outName = `${uuidv4()}.docx`;
  const outPath = path.join(uploadsDir, outName);

  try {
    await fs.rename(inPath, workPdfPath);
  } catch (err) {
    await fs.unlink(inPath).catch(() => {});
    next(err);
    return;
  }

  let converted = false;
  let lastErr = null;

  if (libreOfficeCmd) {
    try {
      await convertWithLibreOffice(workPdfPath, outPath);
      converted = true;
    } catch (err) {
      lastErr = err;
      await fs.unlink(outPath).catch(() => {});
      const base = path.basename(workPdfPath, path.extname(workPdfPath));
      await fs.unlink(path.join(uploadsDir, `${base}.docx`)).catch(() => {});
    }
  }

  if (!converted && pdf2docxAvailable) {
    try {
      await convertWithPdf2docx(workPdfPath, outPath);
      converted = true;
    } catch (err) {
      lastErr = err;
      await fs.unlink(outPath).catch(() => {});
    }
  }

  await fs.unlink(workPdfPath).catch(() => {});

  if (!converted) {
    const message = lastErr?.message || 'Conversion failed';
    const err = new Error(
      /not found|ENOENT|No such file|spawn/i.test(message)
        ? 'Conversion failed. Check that LibreOffice or Python pdf2docx is installed and working.'
        : message
    );
    err.status = 500;
    next(err);
    return;
  }

  deleteAfterDelay(outPath);

  res.json({
    downloadUrl: `/api/download/${outName}`,
  });
});

module.exports = router;
