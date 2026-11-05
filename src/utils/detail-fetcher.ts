// =========================================================================
// src/utils/detail-fetcher.ts
// Responsible for recovering missing phone numbers from the place details.
// Opens each listing card, reads the contact button of the detail panel,
// formats the number and navigates back to the results list.
// =========================================================================

import type { Page } from 'puppeteer';
import type { Place } from '@/types';
import { formatPhone } from '@/utils/phone';

const PLACE_CARD = '.hfpxzc';
const PHONE_BUTTON = 'button[data-item-id^="phone:tel:"]';

async function extractPhoneFromDetailPanel(page: Page): Promise<string | null> {
  try {
    const btn = await page.waitForSelector(PHONE_BUTTON, { timeout: 3000 }).catch(() => null);
    if (!btn) return null;

    const raw = await page.evaluate((selector) => {
      const b = document.querySelector<HTMLElement>(selector);
      if (!b) return null;

      const label = b.getAttribute('aria-label') ?? '';
      const labelMatch = /[\d\s()\-+]{8,}/.exec(label);
      if (labelMatch) return labelMatch[0].trim();

      const dataId = b.getAttribute('data-item-id') ?? '';
      const telMatch = /phone:tel:(\+?\d+)/.exec(dataId);
      return telMatch?.[1] ?? null;
    }, PHONE_BUTTON);

    return formatPhone(raw);
  } catch {
    return null;
  }
}

async function goBack(page: Page): Promise<void> {
  const escaped = await page.evaluate(() => {
    const buttons = document.querySelectorAll<HTMLElement>('button');
    for (const btn of buttons) {
      const a = (btn.getAttribute('aria-label') ?? '').toLowerCase();
      if (a.includes('voltar') ?? a.includes('back')) {
        btn.click();
        return true;
      }
    }
    return false;
  });

  if (!escaped) {
    await page.keyboard.press('Escape');
  }
  await page.waitForSelector(PLACE_CARD, { timeout: 5000 }).catch(() => {
    /* Selector timeout ignored */
  });
}

async function findAndClickCard(page: Page, place: Place): Promise<boolean> {
  return page.evaluate(
    (title, url, selector) => {
      const cards = document.querySelectorAll<HTMLElement>(selector);
      for (const card of cards) {
        const href = card.getAttribute('href');
        const label = card.getAttribute('aria-label') ?? '';
        if ((url && href === url) ?? label.includes(title)) {
          card.scrollIntoView({ block: 'center' });
          setTimeout(() => {
            card.click();
          }, 50);
          return true;
        }
      }
      return false;
    },
    place.title,
    place.placeUrl ?? '',
    PLACE_CARD,
  );
}

export async function fetchPhoneDetails(
  page: Page,
  places: Place[],
  delay: number = 800,
): Promise<Place[]> {
  const withoutPhone = places
    .map((place, index) => ({ place, index }))
    .filter(({ place }) => place.phone === 'N/A');
  if (withoutPhone.length === 0) return places;

  const phoneMap = new Map<number, string>();

  for (const { place, index: originalIndex } of withoutPhone) {
    try {
      const clicked = await findAndClickCard(page, place);
      if (!clicked) continue;

      await new Promise((r) => setTimeout(r, 1000));

      const phone = await extractPhoneFromDetailPanel(page);
      if (phone) {
        phoneMap.set(originalIndex, phone);
      }

      await goBack(page);
      await new Promise((r) => setTimeout(r, delay));
    } catch {
      await goBack(page).catch(() => {
        /* Navigation failure ignored */
      });
    }
  }

  return places.map((p, index) => {
    const phone = phoneMap.get(index);
    return phone ? { ...p, phone } : p;
  });
}
