const Deal = require("../models/Deal");
const Contact = require("../models/Contact");
const User = require("../models/User");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");
const  buildFilter  = require("../utils/buildfilter");
/*const buildFilter = (req, dealId) => {
  const filter = { company: req.user.company };

  if (dealId) filter._id = dealId;

  if (req.user.role === "sales_rep") {
    filter.assignedTo = req.user._id;
  }

  return filter;
};*/

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

  const deal = await Deal.create({
    title: req.body.title,
    value: req.body.value,
    currency: req.body.currency,
    stage: req.body.stage,
    expectedCloseDate: req.body.expectedCloseDate,
    notes: req.body.notes,

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

  delete req.body.company;
  delete req.body.assignedTo;
  delete req.body.contact;
  delete req.body.stage;

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
  const { stage } = req.body;

  const allowedStages = ["lead", "qualified", "proposal", "won", "lost"];
  if (!allowedStages.includes(stage)) {
    return next(new AppError("Invalid stage value", 400));
  }

  const filter = buildFilter(req, req.params.id);

  const update = { stage };
  if (stage === "won" || stage === "lost") update.closedAt = new Date();

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
  const { assignedTo } = req.body;

  if (!assignedTo) {
    return next(new AppError("Please provide assignedTo user id", 400));
  }

  const user = await User.findOne({
    _id: assignedTo,
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

/*exports.getDealStats = catchAsync(async (req, res, next) => {
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
