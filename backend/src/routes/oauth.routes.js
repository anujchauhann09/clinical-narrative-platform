import { Router } from 'express';

import { handleCallback, redirectToProvider } from '../controllers/oauth.controller.js';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.get('/:provider', authRateLimiter, redirectToProvider);
router.get('/:provider/callback', handleCallback);

export default router;
