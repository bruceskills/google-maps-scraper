import type { Page } from 'puppeteer';
import logger from '@/config/logger';

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function scrollAndLoadPlaces(
  page: Page,
  targetCount: number,
  scrollDelay: number,
  maxScrolls: number,
  onIteration?: (count: number) => Promise<void>,
): Promise<number> {
  try {
    await page.waitForFunction(
      () => document.querySelector('[role="feed"]') ?? document.querySelector('.bfdHYd'),
      { timeout: 15000 },
    );

    await wait(2000);

    let itemCount = await page.evaluate(() => document.querySelectorAll('.bfdHYd').length);

    let scrollCount = 0;
    let stalledCount = 0;

    logger.info(`Start: ${itemCount} items`);

    while (scrollCount < maxScrolls && itemCount < targetCount && stalledCount < 5) {
      await page.keyboard.press('PageDown');
      await wait(scrollDelay);

      const newCount = await page.evaluate(() => document.querySelectorAll('.bfdHYd').length);

      if (newCount > itemCount) {
        logger.info(`Scroll #${scrollCount + 1}: ${newCount} items (+${newCount - itemCount})`);
        stalledCount = 0;
        if (onIteration) await onIteration(newCount);
      } else {
        stalledCount++;
        await page.keyboard.press('End');
        await wait(scrollDelay);
      }

      itemCount = newCount;
      scrollCount++;
    }

    logger.info(`Scroll finished: ${scrollCount} iterations, ${itemCount} items`);
    return itemCount;
  } catch (error) {
    logger.error(`Scroll error: ${error}`);
    return 0;
  }
}
