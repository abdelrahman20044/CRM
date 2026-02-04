const User = require("./../models/User");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};
exports.register = catchAsync((req, res, next) => {});
exports.login = catchAsync((req, res, next) => {});
exports.forgetPassword = catchAsync((req, res, next) => {});
exports.resetPassword = catchAsync((req, res, next) => {});
exports.me = catchAsync((req, res, next) => {});
