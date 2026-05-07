const Contact = require("../models/Contact");
const User = require("../models/User");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");
const  buildFilter  = require("../utils/buildfilter");


exports.getAllContacts = catchAsync(async (req, res, next) => {
  const query = buildFilter(req);

  const features = new APIFeatures(Contact.find(query), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const contacts = await features.query.populate("assignedTo", "name email");

  res.status(200).json({
    status: "success",
    results: contacts.length,
    data: { contacts },
  });
});

exports.getContact = catchAsync(async (req, res, next) => {
  const filter = buildFilter(req, req.params.id);

  const contact = await Contact.findOne(filter).populate(
    "assignedTo",
    "name email",
  );

  if (!contact) {
    return next(new AppError("No contact found with this ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { contact },
  });
});

exports.createContact = catchAsync(async (req, res, next) => {
  // req.body is already validated & whitelisted by Zod
  const contact = await Contact.create({
    ...req.body,
    assignedTo: req.user._id,
    company: req.user.company,
  });

  res.status(201).json({
    status: "success",
    data: { contact },
  });
});

exports.assignContact = catchAsync(async (req, res, next) => {
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
  const contact = await Contact.findOneAndUpdate(
    filter,
    { assignedTo: user._id },
    { new: true, runValidators: true },
  ).populate("assignedTo", "name email");

  if (!contact) {
    return next(new AppError("Contact not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { contact },
  });
});

exports.updateContact = catchAsync(async (req, res, next) => {
  const filter = buildFilter(req, req.params.id);

  // req.body is already whitelisted by Zod (no company/assignedTo possible)
  const contact = await Contact.findOneAndUpdate(filter, req.body, {
    new: true,
    runValidators: true,
  }).populate("assignedTo", "name email");

  if (!contact) {
    return next(new AppError("No contact found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { contact },
  });
});

exports.deleteContact = catchAsync(async (req, res, next) => {
  const filter = buildFilter(req, req.params.id);
  const contact = await Contact.findOneAndDelete(filter);

  if (!contact) {
    return next(new AppError("No contact found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
