import { HTTP_STATUS } from '../constants/httpStatus.js';
import { patternInsightsService } from '../services/patternInsights.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPatternInsights = asyncHandler(async (req, res) => {
  const result = await patternInsightsService.refreshAndList(req.auth.sub);
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'Pattern insights computed',
      data: { insights: result },
    }),
  );
});

export const dismissPatternInsight = asyncHandler(async (req, res) => {
  await patternInsightsService.dismiss({
    userPublicId: req.auth.sub,
    publicId: req.params.publicId,
  });
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({ message: 'Pattern dismissed' }),
  );
});

export const submitPatternInsightFeedback = asyncHandler(async (req, res) => {
  await patternInsightsService.submitFeedback({
    userPublicId: req.auth.sub,
    publicId: req.params.publicId,
    feedback: req.body?.feedback,
  });
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({ message: 'Feedback recorded' }),
  );
});
