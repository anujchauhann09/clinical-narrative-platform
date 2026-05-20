import { Router } from 'express';

import {
  generateDoctorSummary,
  generatePatternExplanation,
  generateSymptomNarrative,
  generateTimelineNarrative,
  listSummaries,
} from '../controllers/narrative.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { aiGenerationRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validateRequest } from '../middlewares/validateRequest.middleware.js';
import {
  generateNarrativeSchema,
  listSummariesSchema,
} from '../validators/narrative.validator.js';

const router = Router();

router.use(authenticate);

router.get('/narratives', validateRequest(listSummariesSchema), listSummaries);

router.post(
  '/narratives/symptom',
  aiGenerationRateLimiter,
  validateRequest(generateNarrativeSchema),
  generateSymptomNarrative,
);

router.post(
  '/narratives/pattern',
  aiGenerationRateLimiter,
  validateRequest(generateNarrativeSchema),
  generatePatternExplanation,
);

router.post(
  '/narratives/doctor-summary',
  aiGenerationRateLimiter,
  validateRequest(generateNarrativeSchema),
  generateDoctorSummary,
);

router.post(
  '/narratives/timeline',
  aiGenerationRateLimiter,
  validateRequest(generateNarrativeSchema),
  generateTimelineNarrative,
);

export default router;
