import { Router } from 'express';

import { getMe, login, logout, refreshToken, signup } from '../controllers/auth.controller.js';
import { exchangeOAuthCode } from '../controllers/oauth.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validateRequest } from '../middlewares/validateRequest.middleware.js';
import { loginSchema, oauthExchangeSchema, signupSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/auth/signup', authRateLimiter, validateRequest(signupSchema), signup);
router.post('/auth/login', authRateLimiter, validateRequest(loginSchema), login);
router.post(
  '/auth/oauth/exchange',
  authRateLimiter,
  validateRequest(oauthExchangeSchema),
  exchangeOAuthCode,
);
router.post('/auth/refresh', refreshToken);
router.post('/auth/logout', logout);
router.get('/auth/me', authenticate, getMe);

export default router;
