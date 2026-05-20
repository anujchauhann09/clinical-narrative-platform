import { Buffer } from 'node:buffer';

import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from '../errors/index.js';

export const encodeTimelineCursor = (internalId) =>
  Buffer.from(String(internalId), 'utf-8').toString('base64url');

export const decodeTimelineCursor = (cursor) => {
  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf-8');
    if (!/^\d+$/.test(raw)) throw new Error('non-numeric cursor');
    const id = BigInt(raw);
    if (id <= 0n) throw new Error('non-positive cursor');
    return id;
  } catch {
    throw new ApiError('Invalid cursor', HTTP_STATUS.BAD_REQUEST);
  }
};
