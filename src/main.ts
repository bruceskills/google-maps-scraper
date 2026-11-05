import 'dotenv/config';

import { Command } from 'commander';
import type { SearchOptions } from '@/types';
import { GoogleMapsScraper } from '@/scraper/google-maps-scraper';
import { DEFAULT_BROWSER_ARGS } from '@/config/constants';

import fs from 'fs';
import { ParallelPhoneFetcher } from '@/scraper/parallel-phone-fetcher';

import { readAsciiArt } from '@/utils/ascii-art.util';
import logger from '@/config/logger';

interface CliOptions {
  term: string;
  district: string;
  city: string;
  state: string;
  limit: number;
  scrollDelay: number;
  maxScrolls: number;
  fetchPhoneDetails: boolean;
  detailFetchDelay: number;
  poolSize: number;
  headless: boolean;
}

async function time<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await fn();
  logger.info(`${label}: ${(performance.now() - start).toFixed(0)}ms`);
  return result;
}

function createSlug(options: Pick<SearchOptions, 'term' | 'district' | 'city' | 'state'>): string {
  const parts = [options.term, options.district, options.city, options.state]
    .filter(Boolean)
    .map((part) =>
      part
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    );

  return parts.join('-');
}

async function mainV2() {
  console.log(readAsciiArt('.bruce.art'));

  const startTotal = performance.now();

  const program = new Command();

  program
    .version('1.0.0')
    .description('Google Maps scraper CLI')
    .requiredOption('-t, --term <value>', "Termo de busca (ex: 'pet shop')")
    .requiredOption('-d, --district <value>', 'Bairro')
    .requiredOption('-c, --city <value>', 'Cidade')
    .requiredOption('-s, --state <value>', 'Estado (UF)')
    .option('-l, --limit <number>', 'Limite de resultados', (v) => parseInt(v, 10), 50)
    .option('--scroll-delay <number>', 'Delay entre scrolls (ms)', (v) => parseInt(v, 10), 1000)
    .option('--max-scrolls <number>', 'Máximo de scrolls', (v) => parseInt(v, 10), 50)
    .option('--fetch-phone-details', 'Clica em cada card para buscar telefone', false)
    .option(
      '--detail-fetch-delay <number>',
      'Delay entre cliques em cards (ms)',
      (v) => parseInt(v, 10),
      1000,
    )
    .option('--pool-size <number>', 'Pool Size', (v) => parseInt(v, 10), 3)
    .option('--headless', 'Se deve executar o navegador em modo headless.', true)
    .parse(process.argv);

  const opts = program.opts<CliOptions>();

  const searchOptions: SearchOptions = {
    term: opts.term,
    district: opts.district,
    city: opts.city,
    state: opts.state,
    limit: opts.limit,
    scrollDelay: opts.scrollDelay,
    maxScrolls: opts.maxScrolls,
    fetchPhoneDetails: opts.fetchPhoneDetails,
    detailFetchDelay: opts.detailFetchDelay,
  };

  let result;

  await time('Full search', async () => {
    const scraper = new GoogleMapsScraper({
      headless: opts.headless,
      ignoreDefaultArgs: ['--disable-extensions'],
      args: DEFAULT_BROWSER_ARGS,
      defaultViewport: null,
    });

    try {
      await scraper.init();

      result = await scraper.search(searchOptions);

      if (result.success && result.data && searchOptions.fetchPhoneDetails) {
        const withoutPhone = result.data.filter((p) => p.phone === 'N/A');
        if (withoutPhone.length > 0) {
          const parallelFetcher = new ParallelPhoneFetcher(opts.poolSize, 600, opts.headless);
          await parallelFetcher.init();
          try {
            result.data = await parallelFetcher.fetchPhones(result.data);
          } finally {
            await parallelFetcher.close();
          }
        }
      }

      if (result.success && result.data) {
        const filename = `${createSlug(searchOptions)}.json`;
        logger.info(`RESULTS: ${result.data.length}`);
        logger.info(`File saved: ${filename}`);
        fs.writeFileSync(filename, JSON.stringify(result.data, null, 2));
      } else {
        logger.error(`❌ Error: ${result.error}`);
      }
    } finally {
      await scraper.close();
    }
  });

  logger.info(`Total: ${((performance.now() - startTotal) / 1000).toFixed(1)}s`);
}

mainV2().catch(logger.error);
