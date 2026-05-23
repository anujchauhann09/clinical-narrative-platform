import { Router } from 'express';

import {
  deleteMyAccount,
  getMyProfile,
  updateMyProfile,
} from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { validateRequest } from '../middlewares/validateRequest.middleware.js';
import {
  deleteAccountSchema,
  updateProfileSchema,
} from '../validators/user.validator.js';

const router = Router();

router.use(authenticate);

router.get('/users/me', getMyProfile);
router.patch('/users/me', validateRequest(updateProfileSchema), updateMyProfile);
router.delete('/users/me', validateRequest(deleteAccountSchema), deleteMyAccount);

export default router;
