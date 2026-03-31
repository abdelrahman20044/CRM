const Activity = require("../models/Activity");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const buildFilter = require("../utils/buildfilter");

exports.getAllActivities = catchAsync(async (req, res, next) => {
  const query = buildFilter(req);

  // Optional: filter by related entity  ?relatedTo=Deal&relatedId=664a...
  if (req.query.relatedTo) query.relatedTo = req.query.relatedTo;
  if (req.query.relatedId) query.relatedId = req.query.relatedId;

  const features = new APIFeatures(Activity.find(query), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const activities = await features.query.populate("performedBy", "name email");

  res.status(200).json({
    status: "success",
    results: activities.length,
    data: { activities },
  });
});

exports.getActivity = catchAsync(async (req, res, next) => {
  const filter = buildFilter(req, req.params.id);
  const activity = await Activity.findOne(filter).populate(
    "performedBy",
    "name email",
  );

  if (!activity) {
    return next(new AppError("No activity found with this ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { activity },
  });
});

exports.createActivity = catchAsync(async (req, res, next) => {
  const activity = await Activity.create({
    company: req.user.company,
    performedBy: req.user._id,
    type: req.body.type,
    title: req.body.title,
    description: req.body.description,
    relatedTo: req.body.relatedTo,
    relatedId: req.body.relatedId,
    metadata: req.body.metadata,
  });

  res.status(201).json({
    status: "success",
    data: { activity },
  });
});

exports.updateActivity = catchAsync(async (req, res, next) => {
  const filter = buildFilter(req, req.params.id);

  delete req.body.company;
  delete req.body.performedBy;

  const activity = await Activity.findOneAndUpdate(filter, req.body, {
    new: true,
    runValidators: true,
  }).populate("performedBy", "name email");

  if (!activity) {
    return next(new AppError("No activity found with this ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { activity },
  });
});

exports.deleteActivity = catchAsync(async (req, res, next) => {
  const filter = buildFilter(req, req.params.id);
  const activity = await Activity.findOneAndDelete(filter);

  if (!activity) {
    return next(new AppError("No activity found with this ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
