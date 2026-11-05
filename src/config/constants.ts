// =========================================================================
// src/config/constants.ts
// Responsible for the default values of the application.
// Holds the browser path, the Chromium arguments, the default Puppeteer
// and search configurations, and the base Google Maps URL used to query.
// =========================================================================

import type { PuppeteerConfig, SearchOptions } from '@/types';

/**
 * Path of the browser used by default.
 * It can be overridden via the `--executable-path` flag or environment variable.
 * The `npm run find-chrome` script detects the browser of the system and
 * stores the result in the CHROME_PATH variable of the .env file.
 */
export const DEFAULT_EXECUTABLE_PATH = process.env.CHROME_PATH ?? '/usr/bin/google-chrome';

/**
 * Chromium command line arguments applied when the `CHROME_ARGS` environment
 * variable is empty or not set.
 */
const FALLBACK_BROWSER_ARGS: string[] = [
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--disable-setuid-sandbox',
  '--disable-webgl',
  '--disable-features=TranslateUI,BackgroundNetworking,Sync',
  '--start-maximized',
];

/**
 * Reads the Chromium command line arguments from the `CHROME_ARGS` environment
 * variable, where the flags are separated by spaces.
 */
function parseBrowserArgs(raw: string | undefined): string[] {
  const args = raw?.trim();

  if (!args) {
    return [...FALLBACK_BROWSER_ARGS];
  }

  const parsed = args.split(/\s+/).filter(Boolean);

  return parsed.length > 0 ? parsed : [...FALLBACK_BROWSER_ARGS];
}

/**
 * Chromium command line arguments used in all instances.
 * They can be overridden through the `CHROME_ARGS` environment variable.
 */
export const DEFAULT_BROWSER_ARGS: string[] = parseBrowserArgs(process.env.CHROME_ARGS);

export const DEFAULT_PUPPETEER_CONFIG: PuppeteerConfig = {
  headless: true,
  ignoreDefaultArgs: ['--disable-extensions'],
  args: DEFAULT_BROWSER_ARGS,
  timeout: 30000,
  executablePath: DEFAULT_EXECUTABLE_PATH,
  defaultViewport: null,
};

export const DEFAULT_SEARCH_OPTIONS: Partial<SearchOptions> = {
  limit: 10,
  scrollDelay: 1000,
  maxScrolls: 20,
  fetchPhoneDetails: false,
  detailFetchDelay: 1000,
};

export const GOOGLE_MAPS_URL = process.env.GOOGLE_MAPS_URL ?? 'https://www.google.com/maps/search/';
