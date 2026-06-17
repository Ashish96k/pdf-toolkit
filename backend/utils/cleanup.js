const fs = require('fs');
const path = require('path');

/** @type {Map<string, NodeJS.Timeout>} */
const scheduledDeletions = new Map();

function getExpiryMs() {
  const fromEnv = Number(process.env.FILE_EXPIRY_MS);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 3600000;
}

/**
 * @param {string} filename
 */
function cancelScheduledDeletion(filename) {
  const timeoutId = scheduledDeletions.get(filename);
  if (timeoutId) {
    clearTimeout(timeoutId);
    scheduledDeletions.delete(filename);
  }
}

/**
 * Schedule automatic deletion of an output file after the configured expiry window.
 * @param {string} filepath
 * @param {number} [delayMs]
 */
function scheduleOutputDeletion(filepath, delayMs = getExpiryMs()) {
  const filename = path.basename(filepath);
  cancelScheduledDeletion(filename);

  const timeoutId = setTimeout(() => {
    scheduledDeletions.delete(filename);
    fs.unlink(filepath, (err) => {
      if (process.env.NODE_ENV !== 'production') {
        if (err) {
          console.warn('[cleanup] failed to delete', filepath, err.message);
        } else {
          console.log('[cleanup] deleted', filepath);
        }
      }
    });
  }, delayMs);

  scheduledDeletions.set(filename, timeoutId);
}

/**
 * Delete an output file immediately and cancel its scheduled expiry.
 * @param {string} filepath
 * @returns {Promise<void>}
 */
async function deleteOutputFile(filepath) {
  const filename = path.basename(filepath);

  cancelScheduledDeletion(filename);

  try {
    await fs.promises.unlink(filepath);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[cleanup] deleted', filepath);
    }
  } catch (err) {
    if (err && err.code !== 'ENOENT') {
      throw err;
    }
  }
}

/** @deprecated Use scheduleOutputDeletion */
function deleteAfterDelay(filepath, delayMs) {
  scheduleOutputDeletion(filepath, delayMs);
}

module.exports = {
  scheduleOutputDeletion,
  deleteOutputFile,
  deleteAfterDelay,
  getExpiryMs,
};
