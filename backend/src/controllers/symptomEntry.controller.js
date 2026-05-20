import { HTTP_STATUS } from '../constants/httpStatus.js';
import { symptomEntryService } from '../services/symptomEntry.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listSymptoms = asyncHandler(async (_req, res) => {
  const symptoms = await symptomEntryService.listSymptoms();

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'Symptoms fetched',
      data: { symptoms },
    }),
  );
});

export const listTriggers = asyncHandler(async (_req, res) => {
  const triggers = await symptomEntryService.listTriggers();

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'Triggers fetched',
      data: { triggers },
    }),
  );
});

export const createEntry = asyncHandler(async (req, res) => {
  const entry = await symptomEntryService.createEntry(req.auth.sub, req.validated.body);

  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.success({
      message: 'Symptom entry created',
      data: { entry },
    }),
  );
});

export const listEntries = asyncHandler(async (req, res) => {
  const { items, meta } = await symptomEntryService.listEntries(req.auth.sub, req.validated.query);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'Symptom entries fetched',
      data: { entries: items },
      meta,
    }),
  );
});

export const getEntry = asyncHandler(async (req, res) => {
  const entry = await symptomEntryService.getEntry(req.auth.sub, req.validated.params.publicId);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'Symptom entry fetched',
      data: { entry },
    }),
  );
});

export const updateEntry = asyncHandler(async (req, res) => {
  const entry = await symptomEntryService.updateEntry(
    req.auth.sub,
    req.validated.params.publicId,
    req.validated.body,
  );

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'Symptom entry updated',
      data: { entry },
    }),
  );
});

export const deleteEntry = asyncHandler(async (req, res) => {
  await symptomEntryService.deleteEntry(req.auth.sub, req.validated.params.publicId);

  res.status(HTTP_STATUS.NO_CONTENT).send();
});

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await symptomEntryService.getSummary(req.auth.sub);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'Symptom summary fetched',
      data: { summary },
    }),
  );
});
