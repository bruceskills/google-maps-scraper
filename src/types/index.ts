// =========================================================================
// src/types/index.ts
// Responsible for the shared type definitions of the application.
// Declares the contracts used across the scraper: the search filters,
// the browser configuration, the extracted place data and the result
// envelope returned to the caller.
// =========================================================================

import type { Viewport } from 'puppeteer';

export interface SearchOptions {
  term: string;
  district: string;
  city: string;
  state: string;
  limit?: number;
  scrollDelay?: number;
  maxScrolls?: number;
  /** If true, click on each card to look for the phone number when not available in the listing */
  fetchPhoneDetails?: boolean;
  /** Delay between clicks on cards to avoid rate limiting (ms) */
  detailFetchDelay?: number;
}

export interface PuppeteerConfig {
  headless?: boolean;
  args?: string[];
  ignoreDefaultArgs?: string[];
  timeout?: number;
  executablePath?: string;
  defaultViewport?: Viewport | null;
}

export interface Place {
  title: string;
  type: string;
  address: string;
  phone: string;
  latitude: string;
  longitude: string;
  placeUrl?: string;
  dataId?: string;
  website?: string;
}

export interface ScraperResult {
  success: boolean;
  data?: Place[];
  error?: string;
  itemsFound: number;
}
