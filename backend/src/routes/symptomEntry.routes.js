import { Router } from 'express';

import {
  createEntry,
  deleteEntry,
  getEntry,
  getSummary,
  listEntries,
  listSymptoms,
  listTriggers,
  updateEntry,
} from '../controllers/symptomEntry.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { validateRequest } from '../middlewares/validateRequest.middleware.js';
import {
  createSymptomEntrySchema,
  listSymptomEntriesSchema,
  symptomEntryParamsSchema,
  updateSymptomEntrySchema,
} from '../validators/symptomEntry.validator.js';

const router = Router();

router.use(authenticate);

router.get('/symptoms', listSymptoms);
router.get('/triggers', listTriggers);

router.get('/symptom-entries/summary', getSummary);

router.post('/symptom-entries', validateRequest(createSymptomEntrySchema), createEntry);
router.get('/symptom-entries', validateRequest(listSymptomEntriesSchema), listEntries);
router.get(
  '/symptom-entries/:publicId',
  validateRequest(symptomEntryParamsSchema),
  getEntry,
);
router.patch(
  '/symptom-entries/:publicId',
  validateRequest(updateSymptomEntrySchema),
  updateEntry,
);
router.delete(
  '/symptom-entries/:publicId',
  validateRequest(symptomEntryParamsSchema),
  deleteEntry,
);

export default router;
