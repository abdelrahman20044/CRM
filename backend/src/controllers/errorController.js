const AppError = require("./../utils/appError");
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value : ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};
const handleJsonWebTokenError = () => {
  return new AppError("invalid token please login again", 401);
};
const handleTokenExpiredError = () => {
  return new AppError("Expired token login again", 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR ❌", err);
    res.status(500).json({
      status: "error",
      message: "something went very wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Convert known errors to operational AppErrors (all environments)
  let error = Object.create(err);
  if (error.name == "CastError") error = handleCastErrorDB(error);
  if (error.code == 11000) error = handleDuplicateFieldsDB(error);
  if (error.name == "ValidationError") error = handleValidationErrorDB(error);
  if (error.name == "JsonWebTokenError") error = handleJsonWebTokenError();
  if (error.name == "TokenExpiredError") error = handleTokenExpiredError();

  if (process.env.NODE_ENV === "production") {
    sendErrorProd(error, res);
  } else {
    // development, test, or any other environment
    sendErrorDev(error, res);
  }
};
