import { env } from '../config/env.js';

const DEFAULT_SEPARATORS = ['\n\n', '\n', '. ', '? ', '! ', '; ', ', ', ' '];

const splitOnFirstSeparator = (text, separators) => {
  for (const separator of separators) {
    if (text.includes(separator)) {
      return text.split(separator).flatMap((segment, index, all) => {
        if (index === all.length - 1) return [segment];
        return [segment + separator];
      });
    }
  }
  return [text];
};

const mergePieces = (pieces, chunkSize, overlap) => {
  const chunks = [];
  let current = '';

  const pushCurrent = () => {
    if (current.trim().length > 0) chunks.push(current.trim());
  };

  for (const piece of pieces) {
    if ((current + piece).length <= chunkSize) {
      current += piece;
      continue;
    }
    pushCurrent();
    if (overlap > 0 && current.length > 0) {
      current = current.slice(-overlap) + piece;
    } else {
      current = piece;
    }
    while (current.length > chunkSize) {
      chunks.push(current.slice(0, chunkSize).trim());
      current = current.slice(chunkSize - overlap);
    }
  }
  pushCurrent();

  return chunks.filter(Boolean);
};

export const textChunkerService = {
  chunk(text, options = {}) {
    const chunkSize = options.chunkSize ?? env.COPILOT_CHUNK_SIZE;
    const overlap = Math.min(options.overlap ?? env.COPILOT_CHUNK_OVERLAP, Math.floor(chunkSize / 2));

    if (!text || typeof text !== 'string') return [];
    if (text.length <= chunkSize) return [text.trim()].filter(Boolean);

    const pieces = splitOnFirstSeparator(text, DEFAULT_SEPARATORS);
    return mergePieces(pieces, chunkSize, overlap);
  },
};
