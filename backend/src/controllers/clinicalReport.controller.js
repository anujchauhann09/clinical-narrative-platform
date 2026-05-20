import { clinicalReportService } from '../services/clinicalReport.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const downloadClinicalReport = asyncHandler(async (req, res) => {
  const { buffer, filename } = await clinicalReportService.buildPdf(
    req.auth.sub,
    req.validated.query,
  );

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', buffer.length);
  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).end(buffer);
});
