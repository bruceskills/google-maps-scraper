// =========================================================================
// src/utils/validation.ts
// Responsible for validating the search filters before scraping.
// Checks that the required fields (term, district, city and state) are
// present and reports which ones are missing when the input is invalid.
// =========================================================================

import type { SearchOptions } from '@/types';
import logger from '@/config/logger';

export function validateSearchOptions(options: Partial<SearchOptions>): {
  valid: boolean;
  error?: string;
} {
  const required = ['term', 'district', 'city', 'state'];
  const missing = required.filter((field) => !options[field as keyof SearchOptions]);

  if (missing.length > 0) {
    const error = `Parâmetros obrigatórios faltando: ${missing.join(', ')}`;
    logger.error(error);
    return { valid: false, error };
  }

  return { valid: true };
}
