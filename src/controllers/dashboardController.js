const Deal = require("../models/Deal");
const Contact = require("../models/Contact");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const companyId = new mongoose.Types.ObjectId(req.user.company);

  const totalContacts = await Contact.countDocuments({ company: companyId });
  const totalDeals = await Deal.countDocuments({ company: companyId });
  const wonDeals = await Deal.countDocuments({
    company: companyId,
    stage: "won",
  });
  const openDeals = await Deal.countDocuments({
    company: companyId,
    stage: { $nin: ["won", "lost"] },
  });
  const revenueResult = await Deal.aggregate([
    { $match: { company: companyId, stage: "won" } },
    { $group: { _id: null, totalRevenue: { $sum: "$value" } } },
  ]);
  console.log("Aggregate result:", revenueResult);

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
  const companyId = new mongoose.Types.ObjectId(req.user.company);

  const pipeline = await Deal.aggregate([
    { $match: { company: companyId } },
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
