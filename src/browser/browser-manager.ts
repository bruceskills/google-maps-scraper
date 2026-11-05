// =========================================================================
// src/browser/browser-manager.ts
// Responsible for managing the Puppeteer browser instance.
// Launches Chrome with the configured options, keeps a single reusable page
// and blocks heavy resources like images and fonts to speed up the scraping.
// =========================================================================

import puppeteer, { type Browser, type Page } from 'puppeteer';
import type { PuppeteerConfig } from '@/types';
import { DEFAULT_PUPPETEER_CONFIG } from '@/config/constants';
import logger from '@/config/logger';

const BLOCKED_RESOURCES = ['image', 'font', 'media', 'texttrack', 'manifest'];

export class BrowserManager {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private readonly config: PuppeteerConfig;

  constructor(config: Partial<PuppeteerConfig> = {}) {
    this.config = { ...DEFAULT_PUPPETEER_CONFIG, ...config };
  }

  async init(): Promise<void> {
    try {
      const { headless, args, ignoreDefaultArgs, timeout, executablePath, defaultViewport } =
        this.config;

      this.browser = await puppeteer.launch({
        headless: headless ?? true,
        args: args ?? [],
        ignoreDefaultArgs: ignoreDefaultArgs ?? [],
        defaultViewport: defaultViewport ?? null,
        ...(executablePath ? { executablePath } : {}),
      });

      this.page = await this.browser.newPage();
      const pages = await this.browser.pages();
      const initialPage = pages[0];
      if (pages.length > 1 && initialPage) {
        await initialPage.close();
      }
      this.page.setDefaultNavigationTimeout(timeout ?? 30000);
      this.page.setDefaultTimeout(timeout ?? 30000);

      await this.page.setRequestInterception(true);
      this.page.on('request', (request) => {
        const type = request.resourceType();
        if (BLOCKED_RESOURCES.includes(type)) {
          void request.abort();
        } else {
          void request.continue();
        }
      });
    } catch (error) {
      logger.error(`Error starting browser: ${error}`);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }
    } catch (error) {
      logger.error(`Error closing browser: ${error}`);
    }
  }

  getPage(): Page {
    if (!this.page) {
      throw new Error('Page not initialized');
    }
    return this.page;
  }

  async newPage(): Promise<Page> {
    if (!this.browser) throw new Error('Browser not initialized');
    return this.browser.newPage();
  }
}
