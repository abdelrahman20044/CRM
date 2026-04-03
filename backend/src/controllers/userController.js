const User = require("../models/User");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");

const buildUserFilter = (req, userId) => {
  const filter = { company: req.user.company };

  if (userId) filter._id = userId;

  return filter;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const query = buildUserFilter(req);
  const features = new APIFeatures(User.find(query), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query.select("+isActive");
  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});
exports.getUser = catchAsync(async (req, res, next) => {
  const filter = buildUserFilter(req, req.params.id);
  const user = await User.findOne(filter).select("+isActive");
  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;

  if (role === "owner") {
    return next(new AppError("Cannot create owner user", 400));
  }

  if (req.user.role === "admin" && role === "admin") {
    return next(new AppError("Admins cannot create other admins", 403));
  }

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role: role || "sales_rep",
    company: req.user.company,
  });

  user.password = undefined;

  res.status(201).json({
    status: "success",
    data: { user },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Use /updatePassword",
        400,
      ),
    );
  }
  delete req.body.company;

  if (req.body.role) {
    // Can't change to owner
    if (req.body.role === "owner") {
      return next(new AppError("Cannot change role to owner", 400));
    }
    if (req.user.role === "admin") {
      const targetUser = await User.findById(req.params.id);
      if (!targetUser) {
        return next(new AppError("User not found", 404));
      }
      if (targetUser.role === "admin" || req.body.role === "admin") {
        return next(new AppError("Admins cannot modify admin roles", 403));
      }
    }
  }
  const filter = buildUserFilter(req, req.params.id);
  const user = await User.findOneAndUpdate(filter, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("User not found in your company", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  const filter = buildUserFilter(req, req.params.id);
  const user = await User.findOne(filter);

  if (!user) {
    return next(new AppError("User not found in your company", 404));
  }

  if (user.role === "owner") {
    return next(new AppError("Cannot deactivate owner", 400));
  }

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.activateUser = catchAsync(async (req, res, next) => {
  const filter = buildUserFilter(req, req.params.id);

  const user = await User.findOneAndUpdate(
    filter,
    { isActive: true },
    { new: true },
  ).select("+isActive");

  if (!user) {
    return next(new AppError("User not found in your company", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});
