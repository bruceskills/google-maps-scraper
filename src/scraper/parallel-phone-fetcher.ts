// =========================================================================
// src/scraper/parallel-phone-fetcher.ts
// Responsible for recovering phone numbers that are missing from the listings.
// Manages a pool of browser instances, distributes the places without a
// phone across them and visits each place page to read the contact button,
// while rendering a progress bar in the terminal.
// =========================================================================

import { GoogleMapsScraper } from '@/scraper/google-maps-scraper';
import type { Place } from '@/types';
import type { Page } from 'puppeteer';
import { setTimeout } from 'node:timers/promises';
import { DEFAULT_BROWSER_ARGS, DEFAULT_EXECUTABLE_PATH } from '@/config/constants';
import logger from '@/config/logger';

function cliProgress(current: number, total: number, label: string): void {
  const pct = ((current / total) * 100).toFixed(0);
  const bar = '█'.repeat(Math.round((current / total) * 30)).padEnd(30, '░');
  process.stdout.write(`\r${label} ${bar} ${current}/${total} (${pct}%)`);
}

export class ParallelPhoneFetcher {
  private readonly pool: GoogleMapsScraper[];
  private readonly delay: number = 1500;

  constructor(poolSize: number, delay: number, headless: boolean) {
    this.delay = delay;
    this.pool = [];
    for (let i = 0; i < poolSize; i++) {
      this.pool.push(
        new GoogleMapsScraper({
          headless: headless,
          ignoreDefaultArgs: ['--disable-extensions'],
          executablePath: DEFAULT_EXECUTABLE_PATH,
          args: DEFAULT_BROWSER_ARGS,
        }),
      );
    }
  }

  async init(): Promise<void> {
    await Promise.all(this.pool.map((s) => s.init()));
  }

  async close(): Promise<void> {
    await Promise.all(this.pool.map((s) => s.close()));
  }

  async fetchPhones(places: Place[]): Promise<Place[]> {
    const withoutPhone = places.filter((p) => p.phone === 'N/A');
    if (withoutPhone.length === 0) return places;

    logger.info(
      `\n📞 Searching ${withoutPhone.length} phones in parallel (${this.pool.length} workers)...`,
    );

    const results: Place[] = [];
    let completed = 0;

    const worker = async (place: Place, workerIndex: number): Promise<Place> => {
      const scraper = this.pool[workerIndex];

      const browserManager = (scraper as unknown as { browserManager: { getPage: () => Page } })
        .browserManager;
      const page = browserManager.getPage();

      try {
        const phone = await this.fetchSinglePhone(page, place);
        completed++;
        cliProgress(completed, withoutPhone.length, 'Telephones');
        return { ...place, phone: phone ?? 'N/A' };
      } catch {
        completed++;
        cliProgress(completed, withoutPhone.length, 'Telephones');
        return place;
      }
    };

    const chunks: Place[][] = [];
    for (let i = 0; i < withoutPhone.length; i += this.pool.length) {
      chunks.push(withoutPhone.slice(i, i + this.pool.length));
    }

    for (const chunk of chunks) {
      const batch = chunk.map((place, idx) => worker(place, idx));
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }

    process.stdout.write('\n');

    const phoneMap = new Map(results.map((p) => [p.title, p.phone]));
    return places.map((p) => {
      const phone = phoneMap.get(p.title);
      return phone && phone !== 'N/A' ? { ...p, phone } : p;
    });
  }

  private async fetchSinglePhone(
    page: import('puppeteer').Page,
    place: Place,
  ): Promise<string | null> {
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(`${place.title} ${place.address ?? ''}`)}`;

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

    await page.waitForSelector('.hfpxzc', { timeout: 8000 }).catch(() => {
      /* Selector timeout ignored */
    });

    const clicked = await page.evaluate((title) => {
      const cards = document.querySelectorAll<HTMLElement>('.hfpxzc');
      for (const card of cards) {
        if (card.getAttribute('aria-label')?.includes(title)) {
          card.click();
          return true;
        }
      }
      return false;
    }, place.title);

    if (!clicked) return null;

    await setTimeout(this.delay);

    const phone = await page.evaluate(() => {
      const btn = document.querySelector<HTMLElement>('button[data-item-id^="phone:tel:"]');
      if (!btn) return null;
      const tel = btn.getAttribute('data-item-id')?.match(/phone:tel:(\d+)/)?.[1];
      if (!tel || tel.length < 10) return null;
      const ddd = tel.startsWith('0') ? tel.slice(1, 3) : tel.slice(0, 2);
      const rest = tel.slice(-9);
      const part1 = rest.slice(0, rest.length - 4);
      const part2 = rest.slice(-4);
      return `(${ddd}) ${part1}-${part2}`;
    });

    return phone ?? null;
  }
}
