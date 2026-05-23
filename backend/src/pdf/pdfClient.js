import puppeteer from 'puppeteer';

import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

const PDF_FORMAT = 'A4';
const PDF_MARGIN = { top: '18mm', right: '14mm', bottom: '20mm', left: '14mm' };
const RENDER_TIMEOUT_MS = 30_000;

let browserPromise = null;

const launchBrowser = async () => {
  try {
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none',
      ],
    };
    if (env.CHROME_EXECUTABLE_PATH) {
      launchOptions.executablePath = env.CHROME_EXECUTABLE_PATH;
    }
    return await puppeteer.launch(launchOptions);
  } catch (error) {
    logger.error(
      { err: error, executablePath: env.CHROME_EXECUTABLE_PATH ?? '(bundled)' },
      'Failed to launch Chrome',
    );
    throw new ApiError(
      'Failed to launch headless browser. Ensure puppeteer Chromium downloaded during install, or set CHROME_EXECUTABLE_PATH to a valid Chrome binary.',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};

const getBrowser = async () => {
  if (!browserPromise) {
    browserPromise = launchBrowser().catch((error) => {
      browserPromise = null;
      throw error;
    });
  }

  const browser = await browserPromise;
  if (!browser.connected) {
    browserPromise = null;
    return getBrowser();
  }
  return browser;
};

export const pdfClient = {
  async renderHtmlToPdf(html, { headerHtml, footerHtml } = {}) {
    if (!html || typeof html !== 'string') {
      throw new ApiError('PDF html must be a non-empty string', HTTP_STATUS.BAD_REQUEST);
    }

    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
      page.setDefaultNavigationTimeout(RENDER_TIMEOUT_MS);
      await page.emulateMediaType('print');
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: RENDER_TIMEOUT_MS });

      const pdfBuffer = await page.pdf({
        format: PDF_FORMAT,
        margin: PDF_MARGIN,
        printBackground: true,
        preferCSSPageSize: false,
        displayHeaderFooter: Boolean(headerHtml || footerHtml),
        headerTemplate: headerHtml ?? '<span></span>',
        footerTemplate:
          footerHtml ??
          '<div style="width:100%;font-size:9px;color:#60706d;padding:0 14mm;display:flex;justify-content:space-between"><span></span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
        timeout: RENDER_TIMEOUT_MS,
      });

      return pdfBuffer;
    } catch (error) {
      logger.error({ err: error }, 'Failed to render PDF');
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to render PDF', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    } finally {
      await page.close().catch(() => {});
    }
  },

  async close() {
    if (!browserPromise) return;
    try {
      const browser = await browserPromise;
      await browser.close();
    } catch (error) {
      logger.warn({ err: error }, 'Error while closing puppeteer browser');
    } finally {
      browserPromise = null;
    }
  },
};
