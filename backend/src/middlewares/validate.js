const AppError = require("../utils/appError");

const validate =
  (schema, source = "body") =>
  (req, res, next) => {
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
