const User = require("./../models/User");
const Company = require("./../models/Company");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const sendEmail = require("./../utils/email");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};
const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  ),
  httpOnly: true, // cookie cannot be accesed or modified in any way by the browser to prevent (xss)
  // when browser see httponly = true it will receive the cookie store it and send it with every req
};

if (process.env.NODE_ENV == "production") cookieOptions.secure = true; // cookie will only be sent in encrypted connection (HTTPS)
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.cookie("jwt", token, cookieOptions);

  // Remove sensitive fields from output
  user.password = undefined;
  user.isActive = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.register = catchAsync(async (req, res, next) => {
  // 1. Create company first
  const company = await Company.create({
    name: req.body.companyName,
    address: req.body.companyAddress,
    email: req.body.companyEmail,
    phone: req.body.companyPhone,
  });

  // 2. Create user as OWNER (never from req.body.role)
  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      company: company._id,
      role: "owner", // ← Always owner for registration
    });
    /*res.status(201).json({
      status: "success",
      token,
      data: {
        user,
      },
    });*/

    // 3. Send token
    createSendToken(user, 201, res);
  } catch (error) {
    // If user creation fails, delete the company we just created
    await Company.findByIdAndDelete(company._id);
    throw error; // Re-throw to be handled by catchAsync
  }
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  createSendToken(user, 200, res);
});
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("There is no user with that email address", 404));
  }
  const resetToken = user.createPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
  //const resetURL2 = URL(req.protocol, req.get('host'), resetToken);
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL} .\nIf you didn't forget your password, please ignore this email.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    console.log("EMAIL ERROR:", err); // Debug line
    ((user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined));
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email try again later!",
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const HashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: HashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token invalid or expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
});
exports.me = catchAsync((req, res, next) => {
  res.status(200).json({
    user: req.user,
  });
});
