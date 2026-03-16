/**
 * Shared formatter resolution utilities with caching.
 *
 * Extracts project-root discovery, formatter detection, and binary
 * resolution into a single module so that post-edit-format.js and
 * quality-gate.js avoid duplicating work and filesystem lookups.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── Caches (per-process, cleared on next hook invocation) ───────────
const projectRootCache = new Map();
const formatterCache = new Map();
const binCache = new Map();

// ── Config file lists (single source of truth) ─────────────────────

const BIOME_CONFIGS = ['biome.json', 'biome.jsonc'];

const PRETTIER_CONFIGS = [
  '.prettierrc',
  '.prettierrc.json',
  '.prettierrc.js',
  '.prettierrc.cjs',
  '.prettierrc.mjs',
  '.prettierrc.yml',
  '.prettierrc.yaml',
  '.prettierrc.toml',
  'prettier.config.js',
  'prettier.config.cjs',
  'prettier.config.mjs'
];

const PROJECT_ROOT_MARKERS = ['package.json', ...BIOME_CONFIGS, ...PRETTIER_CONFIGS];

// ── Formatter → package name mapping ────────────────────────────────
const FORMATTER_PACKAGES = {
  biome: { binName: 'biome', pkgName: '@biomejs/biome' },
  prettier: { binName: 'prettier', pkgName: 'prettier' }
};

// ── Public helpers ──────────────────────────────────────────────────

/**
 * Walk up from `startDir` until a directory containing a known project
 * root marker (package.json or formatter config) is found.
 * Returns `startDir` as fallback when no marker exists above it.
 */
function findProjectRoot(startDir) {
  if (projectRootCache.has(startDir)) return projectRootCache.get(startDir);

  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    for (const marker of PROJECT_ROOT_MARKERS) {
      if (fs.existsSync(path.join(dir, marker))) {
        projectRootCache.set(startDir, dir);
        return dir;
      }
    }
    dir = path.dirname(dir);
  }

  projectRootCache.set(startDir, startDir);
  return startDir;
}

/**
 * Detect the formatter configured in the project.
 * Biome takes priority over Prettier.
 */
function detectFormatter(projectRoot) {
  if (formatterCache.has(projectRoot)) return formatterCache.get(projectRoot);

  for (const cfg of BIOME_CONFIGS) {
    if (fs.existsSync(path.join(projectRoot, cfg))) {
      formatterCache.set(projectRoot, 'biome');
      return 'biome';
    }
  }

  try {
    const pkgPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if ('prettier' in pkg) {
        formatterCache.set(projectRoot, 'prettier');
        return 'prettier';
      }
    }
  } catch {
    // Malformed package.json — continue to file-based detection
  }

  for (const cfg of PRETTIER_CONFIGS) {
    if (fs.existsSync(path.join(projectRoot, cfg))) {
      formatterCache.set(projectRoot, 'prettier');
      return 'prettier';
    }
  }

  formatterCache.set(projectRoot, null);
  return null;
}

/**
 * Resolve the formatter binary, preferring the local node_modules/.bin
 * installation over npx to avoid package-resolution overhead.
 */
function resolveFormatterBin(projectRoot, formatter) {
  const cacheKey = `${projectRoot}:${formatter}`;
  if (binCache.has(cacheKey)) return binCache.get(cacheKey);

  const pkg = FORMATTER_PACKAGES[formatter];
  if (!pkg) {
    binCache.set(cacheKey, null);
    return null;
  }

  const isWin = process.platform === 'win32';
  const localBin = path.join(projectRoot, 'node_modules', '.bin', isWin ? `${pkg.binName}.cmd` : pkg.binName);

  if (fs.existsSync(localBin)) {
    const result = { bin: localBin, prefix: [] };
    binCache.set(cacheKey, result);
    return result;
  }

  // Fallback to npx
  const bin = isWin ? 'npx.cmd' : 'npx';
  const result = { bin, prefix: [pkg.pkgName] };
  binCache.set(cacheKey, result);
  return result;
}

module.exports = {
  findProjectRoot,
  detectFormatter,
  resolveFormatterBin
};
