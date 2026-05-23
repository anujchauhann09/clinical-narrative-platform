import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from '../errors/index.js';
import { SUPPORTED_MIME_TYPES } from '../services/documentExtraction.service.js';

const MAX_FILENAME_LENGTH = 180;
const SAMPLE_BYTES_FOR_TEXT_CHECK = 4 * 1024;

const startsWith = (buffer, signature) => {
  if (!buffer || buffer.length < signature.length) return false;
  for (let i = 0; i < signature.length; i += 1) {
    if (buffer[i] !== signature[i]) return false;
  }
  return true;
};

const PDF_SIGNATURE = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]); 
const ZIP_SIGNATURE = Buffer.from([0x50, 0x4b, 0x03, 0x04]); 

const looksLikeText = (buffer) => {
  // Empty buffer should already be rejected earlier; treat as not-text.
  if (!buffer || buffer.length === 0) return false;
  const sample = buffer.subarray(0, Math.min(buffer.length, SAMPLE_BYTES_FOR_TEXT_CHECK));
  let nonPrintable = 0;
  for (const byte of sample) {
    // NULL byte is the strongest indicator the file is binary, not text.
    if (byte === 0x00) return false;
    // Allow tab, LF, CR plus all printable ASCII / UTF-8 continuation bytes.
    const isAllowed =
      byte === 0x09 || byte === 0x0a || byte === 0x0d || (byte >= 0x20 && byte !== 0x7f);
    if (!isAllowed) nonPrintable += 1;
  }
  // Reject if >30% of the sampled bytes are control/non-printable.
  return nonPrintable / sample.length < 0.3;
};

export const verifyDocumentFileType = ({ buffer, declaredMime, filename }) => {
  if (declaredMime === SUPPORTED_MIME_TYPES.PDF) {
    if (!startsWith(buffer, PDF_SIGNATURE)) {
      throw new ApiError(
        `"${filename}" does not look like a real PDF (magic bytes missing).`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    return SUPPORTED_MIME_TYPES.PDF;
  }

  if (declaredMime === SUPPORTED_MIME_TYPES.DOCX) {
    if (!startsWith(buffer, ZIP_SIGNATURE)) {
      throw new ApiError(
        `"${filename}" does not look like a real DOCX (ZIP signature missing).`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    return SUPPORTED_MIME_TYPES.DOCX;
  }

  if (declaredMime === SUPPORTED_MIME_TYPES.TXT || declaredMime?.startsWith?.('text/')) {
    if (!looksLikeText(buffer)) {
      throw new ApiError(
        `"${filename}" is not a plain-text file (binary content detected).`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    return SUPPORTED_MIME_TYPES.TXT;
  }

  throw new ApiError(
    `Unsupported file type "${declaredMime}". Allowed: PDF, DOCX, TXT.`,
    HTTP_STATUS.BAD_REQUEST,
  );
};

export const sanitizeFilename = (rawName) => {
  const fallback = 'document';
  if (!rawName || typeof rawName !== 'string') return fallback;

  // Take only the basename, never any directory portion the client tried to send.
  const base = rawName.split(/[\\/]/).pop() ?? rawName;

  const cleaned = base
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/[^A-Za-z0-9._\-() ]+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/\s+/g, ' ')
    .replace(/^[._\s-]+/, '')
    .replace(/[._\s-]+$/, '')
    .slice(0, MAX_FILENAME_LENGTH)
    .trim();

  return cleaned || fallback;
};
