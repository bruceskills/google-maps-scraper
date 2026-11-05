// =========================================================================
// src/utils/ascii-art.util.ts
// Responsible for loading the ASCII art files.
// Resolves the art inside the public folder of the project, reading the
// splash content (banner, version and welcome text) and returning it as a
// string, or null when the file cannot be found or read.
// =========================================================================

import fs from 'fs';
import path from 'path';

import logger from '@/config/logger';

/** Folder of the project that stores the art files. */
const ART_DIRECTORY = 'public';

/** Default art used by the CLI splash (hidden file: `.bruce.art`). */
const DEFAULT_ART_FILE = '.bruce.art';

/** How many parent folders are inspected when locating the project root. */
const MAX_ROOT_SEARCH_DEPTH = 5;

/**
 * Lists the candidate roots, starting at the current working directory and
 * walking up through its parents.
 */
function candidateRoots(): string[] {
  const roots: string[] = [];
  let current = process.cwd();

  for (let depth = 0; depth < MAX_ROOT_SEARCH_DEPTH; depth += 1) {
    roots.push(current);

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return roots;
}

/**
 * Locates the art file, accepting an absolute path, a path relative to the
 * current directory or a file name inside the public folder.
 */
function findArtPath(file: string): string | null {
  if (path.isAbsolute(file)) {
    return fs.existsSync(file) ? file : null;
  }

  const fileName = path.basename(file);

  for (const root of candidateRoots()) {
    const candidates = [path.resolve(root, ART_DIRECTORY, fileName), path.resolve(root, fileName)];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) return candidate;
    }
  }

  return null;
}

/**
 * Reads the ASCII art file and returns its content.
 *
 * @param file Name of the art file inside the public folder.
 * @returns The art content, or `null` when the file is missing or unreadable.
 */
export const readAsciiArt = (file: string = DEFAULT_ART_FILE): string | null => {
  const artPath = findArtPath(file);

  if (!artPath) {
    logger.error(`ASCII art file not found: ${file}`);
    return null;
  }

  try {
    return fs.readFileSync(artPath, 'utf-8');
  } catch (error) {
    logger.error(`Error reading ASCII art: ${error}`);
    return null;
  }
};
