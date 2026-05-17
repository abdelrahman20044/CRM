const Deal = require("../models/Deal");
const Contact = require("../models/Contact");
const User = require("../models/User");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");
const buildFilter = require("../utils/buildfilter");

exports.getAllDeals = catchAsync(async (req, res, next) => {
  const query = buildFilter(req);

  const features = new APIFeatures(Deal.find(query), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const deals = await features.query
    .populate("assignedTo", "name email")
    .populate("contact", "name email phone status");

  res.status(200).json({
    status: "success",
    results: deals.length,
    data: { deals },
  });
});

exports.getDeal = catchAsync(async (req, res, next) => {
  const filter = buildFilter(req, req.params.id);

  const deal = await Deal.findOne(filter)
    .populate("assignedTo", "name email")
    .populate("contact", "name email phone status");

  if (!deal) {
    return next(new AppError("No deal found with this ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { deal },
  });
});

exports.createDeal = catchAsync(async (req, res, next) => {
  const contact = await Contact.findOne({
    _id: req.body.contact,
    company: req.user.company,
  });

  if (!contact) {
    return next(new AppError("Invalid contact for your company", 400));
  }

  // req.body is already validated & whitelisted by Zod
  const deal = await Deal.create({
    ...req.body,
    contact: contact._id,
    assignedTo: req.user._id,
    company: req.user.company,
  });

  res.status(201).json({
    status: "success",
    data: { deal },
  });
});

exports.updateDeal = catchAsync(async (req, res, next) => {
  const filter = buildFilter(req, req.params.id);

  // req.body is already whitelisted by Zod (no company/assignedTo/contact/stage possible)
  const deal = await Deal.findOneAndUpdate(filter, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("assignedTo", "name email")
    .populate("contact", "name email phone status");

  if (!deal) {
    return next(new AppError("No deal found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { deal },
  });
});

exports.changeDealStage = catchAsync(async (req, res, next) => {
  // req.body.stage is guaranteed to be a valid enum value (Zod)
  const { stage } = req.body;
  const filter = buildFilter(req, req.params.id);

  const update = { stage }; // { stage: stage }
  if (stage === "won" || stage === "lost") update.closedAt = new Date(); // ex update is { stage: "won", closedAt: "2026-05-13..." }

  const deal = await Deal.findOneAndUpdate(filter, update, {
    new: true,
    runValidators: true,
  })
    .populate("assignedTo", "name email")
    .populate("contact", "name email phone status");

  if (!deal) {
    return next(new AppError("No deal found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { deal },
  });
});

exports.assignDeal = catchAsync(async (req, res, next) => {
  // req.body.assignedTo is guaranteed to exist and be a valid ObjectId format (Zod)
  const user = await User.findOne({
    _id: req.body.assignedTo,
    company: req.user.company,
    isActive: true,
  });

  if (!user) {
    return next(new AppError("User not found in your company", 404));
  }

  const filter = buildFilter(req, req.params.id);
  const deal = await Deal.findOneAndUpdate(
    filter,
    { assignedTo: user._id },
    { new: true, runValidators: true },
  )
    .populate("assignedTo", "name email")
    .populate("contact", "name email phone status");

  if (!deal) {
    return next(new AppError("No deal found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { deal },
  });
});

exports.deleteDeal = catchAsync(async (req, res, next) => {
  const filter = buildFilter(req, req.params.id);
  const deal = await Deal.findOneAndDelete(filter);

  if (!deal) {
    return next(new AppError("No deal found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
