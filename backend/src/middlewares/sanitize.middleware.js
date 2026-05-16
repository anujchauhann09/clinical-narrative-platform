import { sanitizeObject } from '../utils/sanitizeObject.js';

export const sanitizeRequest = (req, _res, next) => {
  req.body = sanitizeObject(req.body);
  req.params = sanitizeObject(req.params);
  req.sanitizedQuery = sanitizeObject(req.query);
  next();
};
