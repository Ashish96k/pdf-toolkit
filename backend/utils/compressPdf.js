const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const { uploadsDir } = require('../config');

const PRESET_LEVELS = ['low', 'medium', 'high'];

/**
 * Hybrid Ghostscript profiles: PDFSETTINGS presets for reliable baselines,
 * plus explicit overrides so medium and high diverge on image-heavy PDFs.
 */
const LEVEL_PROFILES = {
  low: {
    pdfSettings: '/printer',
    overrides: [],
  },
  medium: {
    pdfSettings: '/ebook',
    overrides: [
      '-dDownsampleColorImages=true',
      '-dDownsampleGrayImages=true',
      '-dColorImageResolution=150',
      '-dGrayImageResolution=150',
      '-dColorImageDownsampleThreshold=1.25',
      '-dGrayImageDownsampleThreshold=1.25',
      '-dAutoFilterColorImages=false',
      '-dAutoFilterGrayImages=false',
      '-dColorImageFilter=/DCTEncode',
      '-dGrayImageFilter=/DCTEncode',
      '-dPassThroughJPEGImages=false',
    ],
    distiller: {
      qFactor: 0.5,
      hSamples: [2, 1, 1, 2],
      vSamples: [2, 1, 1, 2],
    },
  },
  high: {
    pdfSettings: '/screen',
    overrides: [
      '-dDownsampleColorImages=true',
      '-dDownsampleGrayImages=true',
      '-dColorImageResolution=72',
      '-dGrayImageResolution=72',
      '-dColorImageDownsampleType=/Subsample',
      '-dGrayImageDownsampleType=/Subsample',
      '-dColorImageDownsampleThreshold=1.0',
      '-dGrayImageDownsampleThreshold=1.0',
      '-dAutoFilterColorImages=false',
      '-dAutoFilterGrayImages=false',
      '-dColorImageFilter=/DCTEncode',
      '-dGrayImageFilter=/DCTEncode',
      '-dPassThroughJPEGImages=false',
    ],
    distiller: {
      qFactor: 0.9,
      hSamples: [2, 2, 2, 2],
      vSamples: [2, 2, 2, 2],
    },
  },
};

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * @param {number} a
 * @param {number} b
 * @param {number} t
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Custom "extreme shrink" profile. Strength 0 ≈ Smallest-file preset; 100 = max aggression.
 *
 * @param {number} strength 0–100
 */
function buildCustomProfile(strength) {
  const t = clamp(Number(strength), 0, 100) / 100;
  const dpi = Math.round(lerp(72, 36, t));
  const monoDpi = Math.round(lerp(150, 72, t));
  const qFactor = Number(lerp(0.9, 1.0, t).toFixed(2));
  const threshold = Number(lerp(1.0, 0.75, t).toFixed(2));
  const useGrayscale = t >= 0.55;
  const downsampleType = t >= 0.35 ? 'Subsample' : 'Average';
  const chroma = t >= 0.75 ? [2, 2, 2, 2] : [2, 2, 2, 2];

  /** @type {string[]} */
  const overrides = [
    '-dDownsampleColorImages=true',
    '-dDownsampleGrayImages=true',
    '-dDownsampleMonoImages=true',
    `-dColorImageResolution=${dpi}`,
    `-dGrayImageResolution=${dpi}`,
    `-dMonoImageResolution=${monoDpi}`,
    `-dColorImageDownsampleType=/${downsampleType}`,
    `-dGrayImageDownsampleType=/${downsampleType}`,
    `-dMonoImageDownsampleType=/Subsample`,
    `-dColorImageDownsampleThreshold=${threshold}`,
    `-dGrayImageDownsampleThreshold=${threshold}`,
    `-dMonoImageDownsampleThreshold=${threshold}`,
    '-dAutoFilterColorImages=false',
    '-dAutoFilterGrayImages=false',
    '-dColorImageFilter=/DCTEncode',
    '-dGrayImageFilter=/DCTEncode',
    '-dEncodeColorImages=true',
    '-dEncodeGrayImages=true',
    '-dPassThroughJPEGImages=false',
    '-dCompressFonts=true',
    '-dSubsetFonts=true',
  ];

  if (useGrayscale) {
    overrides.push('-dColorConversionStrategy=/Gray');
  }

  return {
    pdfSettings: '/screen',
    overrides,
    distiller: {
      qFactor,
      hSamples: chroma,
      vSamples: chroma,
    },
    meta: { dpi, qFactor, grayscale: useGrayscale },
  };
}

/**
 * @param {unknown} value
 */
function parseCustomStrength(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return clamp(Math.round(parsed), 0, 100);
}

/**
 * @param {{ level?: unknown; strength?: unknown }} body
 */
function parseCompressionRequest(body) {
  const level = String(body?.level ?? '').toLowerCase();

  if (level === 'custom') {
    const strength = parseCustomStrength(body?.strength);
    if (strength == null) return null;
    return { level: 'custom', strength };
  }

  if (LEVEL_PROFILES[level]) {
    return { level };
  }

  return null;
}

/**
 * @param {{ level: string; strength?: number }} request
 */
function resolveCompressionProfile(request) {
  if (request.level === 'custom') {
    return buildCustomProfile(request.strength ?? 0);
  }
  return LEVEL_PROFILES[request.level] ?? null;
}

/**
 * @param {string} level
 */
function getCompressionProfile(level) {
  if (level === 'custom') return null;
  return LEVEL_PROFILES[String(level).toLowerCase()] ?? null;
}

/**
 * @param {string} level
 */
function getPdfSettingsForLevel(level) {
  if (level === 'custom') return { custom: true };
  return getCompressionProfile(level);
}

/**
 * @param {{ qFactor: number; hSamples: number[]; vSamples: number[] }} distiller
 */
function buildDistillerParams(distiller) {
  const hSamples = distiller.hSamples.join(' ');
  const vSamples = distiller.vSamples.join(' ');
  const imageDict = [
    `/QFactor ${distiller.qFactor}`,
    '/Blend 1',
    '/ColorTransform 1',
    `/HSamples [${hSamples}]`,
    `/VSamples [${vSamples}]`,
  ].join(' ');

  return [
    '<<',
    `/ColorImageDict << ${imageDict} >>`,
    `/GrayImageDict << ${imageDict} >>`,
    `/ColorACSImageDict << ${imageDict} >>`,
    `/GrayACSImageDict << ${imageDict} >>`,
    '>> setdistillerparams',
  ].join(' ');
}

/**
 * @param {string} inPath
 * @param {string} outPath
 * @param {typeof LEVEL_PROFILES.low} profile
 */
function buildGsArgs(inPath, outPath, profile) {
  const args = [
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.4',
    `-dPDFSETTINGS=${profile.pdfSettings}`,
    '-dNOPAUSE',
    '-dQUIET',
    '-dBATCH',
    '-dSAFER',
    ...profile.overrides,
    `-sOutputFile=${outPath}`,
  ];

  if (profile.distiller) {
    args.push('-c', buildDistillerParams(profile.distiller));
  }

  args.push('-f', inPath);
  return args;
}

/**
 * @param {string[]} args
 */
function runGhostscript(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('gs', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `Ghostscript exited with code ${code}`));
    });
  });
}

/**
 * @param {string} inPath
 * @param {{ level: string; strength?: number }} request
 * @param {number | undefined} originalSizeHint
 */
async function compressPdfFile(inPath, request, originalSizeHint) {
  const profile = resolveCompressionProfile(request);
  if (!profile) {
    const err = new Error(
      'Invalid compression options. Use level low, medium, high, or custom with strength 0–100.'
    );
    err.status = 400;
    throw err;
  }

  const outName = `${uuidv4()}.pdf`;
  const outPath = path.join(uploadsDir, outName);
  const args = buildGsArgs(inPath, outPath, profile);

  try {
    await runGhostscript(args);

    const outStat = await fs.stat(outPath);
    const originalSize =
      typeof originalSizeHint === 'number'
        ? originalSizeHint
        : (await fs.stat(inPath)).size;

    return {
      originalSize,
      compressedSize: outStat.size,
      outPath,
      outName,
    };
  } catch (err) {
    await fs.unlink(outPath).catch(() => {});
    const message = err?.message || 'Compression failed';
    const wrapped = new Error(
      /not found|ENOENT|spawn/i.test(message)
        ? 'Ghostscript (gs) is not available on the server. Install it to enable PDF compression.'
        : message
    );
    wrapped.status = 500;
    throw wrapped;
  }
}

module.exports = {
  PRESET_LEVELS,
  LEVEL_PROFILES,
  buildCustomProfile,
  parseCompressionRequest,
  parseCustomStrength,
  getCompressionProfile,
  getPdfSettingsForLevel,
  compressPdfFile,
};
