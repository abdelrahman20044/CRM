class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

/*
400 Bad Request → "fail" (user sent invalid data)
404 Not Found → "fail" (user requested non-existent resource)
500 Internal Error → "error" (server crashed)
503 Service Unavailable → "error" (server overloaded)
*/
