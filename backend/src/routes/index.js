import { Router } from 'express';

import authRoutes from './auth.routes.js';
import clinicalReportRoutes from './clinicalReport.routes.js';
import healthRoutes from './health.routes.js';
import insightsRoutes from './insights.routes.js';
import narrativeRoutes from './narrative.routes.js';
import symptomEntryRoutes from './symptomEntry.routes.js';

const router = Router();

router.use(authRoutes);
router.use(healthRoutes);
router.use(symptomEntryRoutes);
router.use(insightsRoutes);
router.use(narrativeRoutes);
router.use(clinicalReportRoutes);

export default router;
