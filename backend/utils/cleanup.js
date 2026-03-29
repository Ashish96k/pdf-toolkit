const fs = require('fs');

/**
 * @param {string} filepath
 * @param {number} [delayMs=3600000]
 */
function deleteAfterDelay(filepath, delayMs = 3600000) {
  setTimeout(() => {
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
}

module.exports = { deleteAfterDelay };
