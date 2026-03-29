const path = require('path');
const multer = require('multer');

const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;

function parseMaxFileSize() {
  const raw = process.env.MAX_FILE_SIZE;
  if (raw == null || raw === '') return DEFAULT_MAX_BYTES;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_BYTES;
}

const upload = multer({
  dest: path.join(__dirname, '..', 'uploads'),
  limits: { fileSize: parseMaxFileSize() },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
      return;
    }
    const err = new Error(
      `Invalid file type: expected application/pdf, received ${file.mimetype || 'unknown'}`
    );
    err.status = 400;
    cb(err);
  },
});

module.exports = { upload };
