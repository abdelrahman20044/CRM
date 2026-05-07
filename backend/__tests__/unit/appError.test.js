const AppError = require("../../src/utils/appError");

describe("AppError", () => {
  test("should create an error with the correct message and status code", () => {
    const error = new AppError("Something went wrong", 404);

    expect(error.message).toBe("Something went wrong");
    expect(error.statusCode).toBe(404);
    expect(error.status).toBe("fail"); // 4xx = "fail"
    expect(error.isOperational).toBe(true);
  });

  test('should set status to "error" for 500 status codes', () => {
    const error = new AppError("Server crashed", 500);

    expect(error.status).toBe("error"); // 5xx = "error"
  });

  test("should be an instance of Error", () => {
    const error = new AppError("test", 400);

    expect(error).toBeInstanceOf(Error);
  });
});
