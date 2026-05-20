import { HTTP_STATUS } from '../constants/httpStatus.js';
import { narrativeService } from '../services/narrative.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const generateSymptomNarrative = asyncHandler(async (req, res) => {
  const result = await narrativeService.generateSymptomNarrative(req.auth.sub, req.validated.body);

  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.success({
      message: 'Symptom narrative generated',
      data: result,
    }),
  );
});

export const generatePatternExplanation = asyncHandler(async (req, res) => {
  const result = await narrativeService.generatePatternExplanation(
    req.auth.sub,
    req.validated.body,
  );

  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.success({
      message: 'Pattern explanation generated',
      data: result,
    }),
  );
});

export const generateDoctorSummary = asyncHandler(async (req, res) => {
  const result = await narrativeService.generateDoctorSummary(req.auth.sub, req.validated.body);

  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.success({
      message: 'Doctor visit summary generated',
      data: result,
    }),
  );
});

export const generateTimelineNarrative = asyncHandler(async (req, res) => {
  const result = await narrativeService.generateTimelineNarrative(
    req.auth.sub,
    req.validated.body,
  );

  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.success({
      message: 'Timeline narrative generated',
      data: result,
    }),
  );
});

export const listSummaries = asyncHandler(async (req, res) => {
  const summaries = await narrativeService.listSummaries(req.auth.sub, req.validated.query);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'AI summaries fetched',
      data: { summaries },
    }),
  );
});
