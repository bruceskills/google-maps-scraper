#!/usr/bin/env node
// =========================================================================
// find-chrome.mjs
// Responsible for locating the Chrome/Chromium executable of the system.
// Runs the `which google-chrome || which google-chrome-stable ||
// which chromium-browser || which chromium` chain and stores the first hit
// in the CHROME_PATH variable of the .env file, used by the Puppeteer
// configuration to launch the browser.
// =========================================================================

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/** Binaries looked up, in order of preference. */
const BROWSER_CANDIDATES = [
  'google-chrome',
  'google-chrome-stable',
  'chromium-browser',
  'chromium',
];

/** Environment variable consumed by src/config/constants.ts. */
const ENV_KEY = 'CHROME_PATH';

/** File that receives the detected path. */
const ENV_FILE = path.resolve(process.cwd(), '.env');

/**
 * Runs `which <binary>` and returns the resolved path, or null when the
 * binary is not available.
 *
 * @param {string} binary
 * @returns {string | null}
 */
function which(binary) {
  try {
    const output = execFileSync('which', [binary], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    const found = output.trim();

    return found.length > 0 ? found : null;
  } catch {
    return null;
  }
}

/**
 * Searches the binary inside every folder of the PATH, used as a fallback
 * when the `which` command is not available.
 *
 * @param {string} binary
 * @returns {string | null}
 */
function findInPath(binary) {
  for (const dir of (process.env.PATH ?? '').split(path.delimiter)) {
    if (!dir) continue;

    const candidate = path.join(dir, binary);

    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return candidate;
    } catch {
      /* Not an executable file */
    }
  }

  return null;
}

/**
 * Returns the first browser found, in the order of the candidate list.
 */
function findBrowser() {
  for (const binary of BROWSER_CANDIDATES) {
    const found = which(binary) ?? findInPath(binary);

    if (found) {
      return { binary, path: found };
    }
  }

  return null;
}

/**
 * Creates or updates the CHROME_PATH entry of the .env file, keeping the
 * other variables and comments untouched.
 *
 * @param {string} browserPath
 * @returns {void}
 */
function writeEnvFile(browserPath) {
  const content = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf-8') : '';
  const entry = new RegExp(`^${ENV_KEY}=.*$`, 'm');

  let updated;

  if (entry.test(content)) {
    updated = content.replace(entry, `${ENV_KEY}=${browserPath}`);
  } else {
    const base = content.trimEnd();
    updated = `${base}${base.length > 0 ? '\n' : ''}${ENV_KEY}=${browserPath}\n`;
  }

  fs.writeFileSync(ENV_FILE, updated, 'utf-8');
}

function main() {
  const args = process.argv.slice(2);
  const printOnly = args.includes('--print');
  const shouldWrite = !printOnly && !args.includes('--no-write');

  const browser = findBrowser();

  if (!browser) {
    console.error(`❌ Nenhum navegador encontrado (${BROWSER_CANDIDATES.join(', ')})`);
    process.exit(1);
  }

  if (printOnly) {
    console.log(browser.path);
    return;
  }

  console.log(`🔍 Navegador detectado: ${browser.binary} → ${browser.path}`);

  if (shouldWrite) {
    writeEnvFile(browser.path);
    console.log(`✅ ${ENV_KEY} salvo em ${ENV_FILE}`);
  }
}

main();
