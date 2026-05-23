import { HTTP_STATUS } from '../constants/httpStatus.js';
import { userService } from '../services/user.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearAuthCookies } from '../utils/authCookies.js';

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.auth.sub);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'Profile fetched',
      data: { user },
    }),
  );
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.auth.sub, req.validated.body);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'Profile updated',
      data: { user },
    }),
  );
});

export const deleteMyAccount = asyncHandler(async (req, res) => {
  await userService.deleteAccount(req.auth.sub, req.validated.body.password);

  clearAuthCookies(req, res);
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'Account deleted',
    }),
  );
});
