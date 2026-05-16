export const validateRequest = (schema) => (req, _res, next) => {
  const parsedRequest = schema.parse({
    body: req.body,
    query: req.sanitizedQuery ?? req.query,
    params: req.params,
  });

  req.validated = {
    body: parsedRequest.body ?? req.body,
    query: parsedRequest.query ?? req.sanitizedQuery ?? req.query,
    params: parsedRequest.params ?? req.params,
  };
  req.body = parsedRequest.body ?? req.body;
  req.params = parsedRequest.params ?? req.params;
  next();
};
