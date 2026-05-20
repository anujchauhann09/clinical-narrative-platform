import { Router } from 'express';

import authRoutes from './auth.routes.js';
import healthRoutes from './health.routes.js';
import symptomEntryRoutes from './symptomEntry.routes.js';

const router = Router();

router.use(authRoutes);
router.use(healthRoutes);
router.use(symptomEntryRoutes);

export default router;
