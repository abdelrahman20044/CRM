const Deal = require("../models/Deal");
const Contact = require("../models/Contact");
const catchAsync = require("../utils/catchAsync");
const buildFilter = require("../utils/buildfilter");

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const filter = buildFilter(req);

  const totalContacts = await Contact.countDocuments(filter);
  const totalDeals = await Deal.countDocuments(filter);
  const wonDeals = await Deal.countDocuments({
    ...filter,
    stage: "won",
  });
  const openDeals = await Deal.countDocuments({
    ...filter,
    stage: { $nin: ["won", "lost"] },
  });
  const revenueResult = await Deal.aggregate([
    { $match: { ...filter, stage: "won" } },
    { $group: { _id: null, totalRevenue: { $sum: "$value" } } },
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  res.status(200).json({
    status: "success",
    data: {
      totalContacts,
      totalDeals,
      wonDeals,
      openDeals,
      totalRevenue,
    },
  });
});

exports.getPipelineData = catchAsync(async (req, res, next) => {
  const filter = buildFilter(req);

  const pipeline = await Deal.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$stage",
        count: { $sum: 1 },
        totalValue: { $sum: "$value" },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      pipeline,
    },
  });
});
