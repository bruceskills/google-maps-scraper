// =========================================================================
// src/utils/url-builder.ts
// Responsible for structuring geolocation queries.
// Builds the parameterized Google Maps URL by injecting the search term,
// the neighborhood, the city, and the state of the selected filter.
// =========================================================================

import type { SearchOptions } from '@/types';
import { GOOGLE_MAPS_URL } from '@/config/constants';
import logger from '@/config/logger';

export function buildSearchUrl(options: SearchOptions): string {
  const searchTerm = `${options.term} perto de ${options.district}, ${options.city} ${options.state}`;
  const url = new URL(GOOGLE_MAPS_URL);
  url.searchParams.set('q', searchTerm);

  logger.info(`Constructed URL: ${url.toString()}`);
  return url.toString();
}
