import { Router } from 'express';

import { getMe, login, logout, refreshToken, signup } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { validateRequest } from '../middlewares/validateRequest.middleware.js';
import { loginSchema, signupSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/auth/signup', validateRequest(signupSchema), signup);
router.post('/auth/login', validateRequest(loginSchema), login);
router.post('/auth/refresh', refreshToken);
router.post('/auth/logout', logout);
router.get('/auth/me', authenticate, getMe);

export default router;
