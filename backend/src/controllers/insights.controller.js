import { HTTP_STATUS } from '../constants/httpStatus.js';
import { insightsService } from '../services/insights.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getInsights = asyncHandler(async (req, res) => {
  const insights = await insightsService.getInsights(req.auth.sub);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'Insights computed',
      data: { insights },
    }),
  );
});
