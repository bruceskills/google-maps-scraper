// =========================================================================
// src/scraper/google-maps-scraper.ts
// Responsible for orchestrating the whole Google Maps scraping flow.
// Validates the filters, builds the search URL, loads and scrolls the
// results page, extracts the places and optionally enriches each one
// with phone details before returning the final dataset.
// =========================================================================

import type { SearchOptions, ScraperResult, Place, PuppeteerConfig } from '@/types';
import { DEFAULT_SEARCH_OPTIONS } from '@/config/constants';
import logger from '@/config/logger';
import { BrowserManager } from '@/browser/browser-manager';
import { scrollAndLoadPlaces } from '@/browser/scroll-handler';

import { buildSearchUrl } from '@/utils/url-builder';
import { extractPlaces } from '@/utils/parser';
import { fetchPhoneDetails } from '@/utils/detail-fetcher';
import { validateSearchOptions } from '@/utils/validation';

export class GoogleMapsScraper {
  private browserManager: BrowserManager;

  constructor(config: Partial<PuppeteerConfig> = {}) {
    this.browserManager = new BrowserManager(config);
  }

  async init(): Promise<void> {
    await this.browserManager.init();
  }

  async close(): Promise<void> {
    await this.browserManager.close();
  }

  getPage() {
    return this.browserManager.getPage();
  }

  async search(
    options: Partial<SearchOptions> & { onProgress?: (places: Place[]) => void },
  ): Promise<ScraperResult> {
    const validation = validateSearchOptions(options);
    if (!validation.valid) {
      return { success: false, error: validation.error ?? 'Invalid parameters', itemsFound: 0 };
    }

    const searchOptions: SearchOptions = {
      ...DEFAULT_SEARCH_OPTIONS,
      ...options,
    } as SearchOptions;

    try {
      const url = buildSearchUrl(searchOptions);
      const page = this.browserManager.getPage();

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForFunction(
        () => document.querySelector('[role="feed"]') ?? document.querySelector('.bfdHYd'),
        { timeout: 15000 },
      );

      const query = `${options.term} perto de ${options.district}, ${options.city} ${options.state}`;
      const newObject = {
        url,
        query,
        term: options.term,
        district: options.district,
        city: options.city,
        state: options.state,
      };

      await scrollAndLoadPlaces(
        page,
        searchOptions.limit!,
        searchOptions.scrollDelay!,
        searchOptions.maxScrolls!,
        options.onProgress
          ? async () => {
              const partialPlaces = await extractPlaces(page, newObject);
              const sliced = partialPlaces.slice(0, searchOptions.limit);
              options.onProgress!(sliced);
            }
          : undefined,
      );

      const places = await extractPlaces(page, newObject);
      let limitedPlaces = places.slice(0, searchOptions.limit);

      if (searchOptions.fetchPhoneDetails) {
        const placesWithoutPhone = limitedPlaces.filter((p) => p.phone === 'N/A').length;
        if (placesWithoutPhone > 0) {
          logger.info(`Searching for phones for ${placesWithoutPhone} places...`);
          limitedPlaces = await fetchPhoneDetails(
            page,
            limitedPlaces,
            searchOptions.detailFetchDelay,
          );
        }
      }

      logger.info(`Search completed: ${limitedPlaces.length} places`);

      return {
        success: true,
        data: limitedPlaces,
        itemsFound: limitedPlaces.length,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Search error: ${errorMsg}`);
      return { success: false, error: errorMsg, itemsFound: 0 };
    }
  }
}
