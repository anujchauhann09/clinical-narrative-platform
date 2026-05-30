import { Router } from 'express';

import {
  dismissPatternInsight,
  getPatternInsights,
  submitPatternInsightFeedback,
} from '../controllers/patternInsights.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/pattern-insights', getPatternInsights);
router.post('/pattern-insights/:publicId/dismiss', dismissPatternInsight);
router.post('/pattern-insights/:publicId/feedback', submitPatternInsightFeedback);

export default router;
