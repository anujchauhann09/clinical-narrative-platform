import { COOKIE_NAMES } from '../constants/cookies.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { authService } from '../services/auth.service.js';
import { auditService, AUDIT_ACTIONS } from '../services/audit.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sendAuthSession } from '../utils/authResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearAuthCookies, setCsrfTokenCookie } from '../utils/authCookies.js';
import { generateCsrfToken } from '../utils/csrf.js';

export const signup = asyncHandler(async (req, res) => {
  const user = await authService.signup(req.validated.body);

  auditService.emit({
    userPublicId: user.publicId,
    action: AUDIT_ACTIONS.AUTH_SIGNUP,
    resourceType: 'user',
    resourceId: user.publicId,
    req,
  });

  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.success({
      message: 'Registration successful',
      data: { user },
    }),
  );
});

export const login = asyncHandler(async (req, res) => {
  const session = await authService.login(req.validated.body);

  auditService.emit({
    userPublicId: session.user.publicId,
    action: AUDIT_ACTIONS.AUTH_LOGIN_SUCCESS,
    resourceType: 'user',
    resourceId: session.user.publicId,
    req,
  });

  sendAuthSession(req, res, HTTP_STATUS.OK, session, 'Login successful');
});

export const refreshToken = asyncHandler(async (req, res) => {
  const session = await authService.refresh(req.cookies[COOKIE_NAMES.REFRESH_TOKEN]);
  sendAuthSession(req, res, HTTP_STATUS.OK, session, 'Token refreshed');
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies[COOKIE_NAMES.REFRESH_TOKEN]);

  auditService.emit({
    userPublicId: req.auth?.sub ?? null,
    action: AUDIT_ACTIONS.AUTH_LOGOUT,
    req,
  });

  clearAuthCookies(req, res);
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'Logout successful',
    }),
  );
});

const CSRF_REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.auth.sub);

  let csrfToken = req.cookies?.[COOKIE_NAMES.CSRF_TOKEN];
  if (!csrfToken) {
    csrfToken = generateCsrfToken();
    setCsrfTokenCookie(req, res, csrfToken, CSRF_REFRESH_TTL_MS);
  }

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'Authenticated user fetched',
      data: { user, csrfToken },
    }),
  );
});
