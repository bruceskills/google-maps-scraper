// =========================================================================
// src/utils/parser.ts
// Responsible for extracting business data from the Google Maps results page.
// Runs inside the browser context, reads the rendered result cards and
// normalizes each one into a Place object (title, type, address, phone,
// website, coordinates, place URL and data ID).
// =========================================================================

import type { Page } from 'puppeteer';
import type { Place } from '@/types';
import logger from '@/config/logger';

export async function extractPlaces(
  page: Page,
  searchOptions: Record<string, unknown>,
): Promise<Place[]> {
  try {
    const places = await page.evaluate((opts): Place[] => {
      const items = document.querySelectorAll<HTMLElement>('.bfdHYd');
      const result: Place[] = [];

      for (const item of items) {
        const parent = item.parentElement;
        const linkEl = parent?.querySelector<HTMLElement>('.hfpxzc');
        const placeUrl = linkEl?.getAttribute('href') ?? null;

        let dataId: string | null = null;
        let latitude: string | null = null;
        let longitude: string | null = null;

        if (placeUrl) {
          const m = /!1s(?<id>[^!]+).+!3d(?<lat>[^!]+)!4d(?<lng>[^!]+)/.exec(placeUrl);
          if (m?.groups) {
            dataId = m.groups.id ?? null;
            latitude = m.groups.lat ?? null;
            longitude = m.groups.lng ?? null;
          }
        }

        const title = item.querySelector('.qBF1Pd')?.textContent?.trim() ?? 'N/A';

        const typeContainer = item.querySelector('.W4Efsd:last-child > .W4Efsd:nth-of-type(1)');
        const typeSpans = typeContainer?.querySelectorAll('span');
        const type = typeSpans?.[0]?.textContent?.replaceAll('·', '').trim() ?? 'N/A';
        const address =
          typeSpans?.[typeSpans.length - 1]?.textContent?.replaceAll('·', '').trim() ?? 'N/A';

        const text = item.textContent ?? '';
        const phoneMatch = /(?:\(\d{2}\)\s?\d{4,5}-\d{4}|\+55\s?\d{2}\s?\d{4,5}-\d{4})/.exec(text);
        const phone = phoneMatch ? phoneMatch[0] : 'N/A';

        const website =
          item.querySelector<HTMLElement>('a.bm892c')?.getAttribute('href') ?? undefined;

        result.push({
          ...opts,
          title,
          type,
          website,
          address,
          phone,
          latitude,
          longitude,
          placeUrl,
          dataId,
        } as unknown as Place);
      }

      return result;
    }, searchOptions);

    logger.info(`${places.length} extracted places`);
    return places;
  } catch (error) {
    logger.error(`Error extracting places: ${error}`);
    throw error;
  }
}
