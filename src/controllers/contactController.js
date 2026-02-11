const Contact = require("../models/Contact");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");
exports.getAllContacts = catchAsync(async (req, res) => {
  const query = { company: req.user.company };
  if (req.user.role === "sales_rep") {
    query.assignedTo = req.user._id;
  }
  const features = new APIFeatures(Contact.find(query), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const contacts = await features.query.populate("assignedTo", "name email"); // Include owner info
  //const contacts = await Contact.find(query);
  res.status(200).json({
    status: "success",
    results: contacts.length,
    data: {
      contacts,
    },
  });
});
exports.getContact = catchAsync(async (req, res, next) => {
  const filter = { _id: req.params.id, company: req.user.company };

  if (req.user.role === "sales_rep") {
    filter.assignedTo = req.user._id;
  }

  const contact = await Contact.findOne(filter).populate(
    "assignedTo",
    "name email",
  );
  if (!contact) {
    return next(new AppError("No contact found with this ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      contact,
    },
  });
});
exports.createContact = catchAsync(async (req, res) => {
  const contact = await Contact.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    source: req.body.source,
    status: req.body.status,
    assignedTo: req.user._id,
    company: req.user.company,
  });
  res.status(201).json({
    status: "success",
    data: {
      contact,
    },
  });
});
exports.assignContact = catchAsync(async (req, res, next) => {
  const { assignedTo } = req.body;
  const user = await User.findOne({
    _id: assignedTo,
    company: req.user.company,
    isActive: true,
  });
  if (!user) {
    return next(new AppError("User not found in your company", 404));
  }
  const contact = await Contact.findOneAndUpdate(
    {
      _id: req.params.id,
      company: req.user.company,
    },
    { assignedTo },
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
  const filter = { _id: req.params.id, company: req.user.company };

  if (req.user.role === "sales_rep") {
    filter.assignedTo = req.user._id;
  }

  if (!["admin", "owner"].includes(req.user.role)) {
    delete req.body.company;
    delete req.body.assignedTo;
  }
  const contact = await Contact.findOneAndUpdate(filter, req.body, {
    new: true,
    runValidators: true,
  });

  if (!contact) {
    return next(new AppError("No contact found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      contact,
    },
  });
});

exports.deleteContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findOneAndDelete({
    _id: req.params.id,
    company: req.user.company,
  });
  if (!contact) {
    return next(new AppError("No contact found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

/*exports.getContactStats = catchAsync(async (req, res, next) => {
  const stats = await Contact.aggregate([
    // Match only user's company
    {
      $match: { company: req.user.company }
    },
    // Group by status and count
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    // Sort by count descending
    {
      $sort: { count: -1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});*/
