import { Router } from 'express';

import authRoutes from './auth.routes.js';
import clinicalReportRoutes from './clinicalReport.routes.js';
import copilotRoutes from './copilot.routes.js';
import healthRoutes from './health.routes.js';
import insightsRoutes from './insights.routes.js';
import narrativeRoutes from './narrative.routes.js';
import symptomEntryRoutes from './symptomEntry.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use(authRoutes);
router.use(healthRoutes);
router.use(userRoutes);
router.use(symptomEntryRoutes);
router.use(insightsRoutes);
router.use(narrativeRoutes);
router.use(clinicalReportRoutes);
router.use(copilotRoutes);

export default router;
