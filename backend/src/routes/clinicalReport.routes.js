import { Router } from 'express';

import { downloadClinicalReport } from '../controllers/clinicalReport.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { pdfExportRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validateRequest } from '../middlewares/validateRequest.middleware.js';
import { clinicalReportQuerySchema } from '../validators/clinicalReport.validator.js';

const router = Router();

router.use(authenticate);

router.get(
  '/reports/clinical',
  pdfExportRateLimiter,
  validateRequest(clinicalReportQuerySchema),
  downloadClinicalReport,
);

export default router;
