import { Router } from 'express';

import { getInsights } from '../controllers/insights.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/insights', getInsights);

export default router;
