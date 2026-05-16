import { HTTP_STATUS } from '../constants/httpStatus.js';
import { healthService } from '../services/health.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHealth = asyncHandler(async (_req, res) => {
  const health = await healthService.getApiHealth();

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'API is healthy',
      data: health,
    }),
  );
});
