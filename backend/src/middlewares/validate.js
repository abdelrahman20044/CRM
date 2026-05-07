const AppError = require("../utils/appError");

/**
 * Express middleware factory — validates req[source] against a Zod schema.
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Which part of the request to validate
 */
const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const messages = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(". ");

    return next(new AppError(messages, 400));
  }

  // Replace req[source] with ONLY the validated, whitelisted fields
  req[source] = result.data;
  next();
};

module.exports = validate;
