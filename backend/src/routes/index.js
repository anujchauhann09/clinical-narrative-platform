import { Router } from 'express';

import authRoutes from './auth.routes.js';
import healthRoutes from './health.routes.js';
import insightsRoutes from './insights.routes.js';
import symptomEntryRoutes from './symptomEntry.routes.js';

const router = Router();

router.use(authRoutes);
router.use(healthRoutes);
router.use(symptomEntryRoutes);
router.use(insightsRoutes);

export default router;
