const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth");
const {
  getDashboardStats,
  getPipelineData,
} = require("../controllers/dashboardController");

router.use(protect);

router.get("/stats", getDashboardStats);
router.get("/pipeline", getPipelineData);

module.exports = router;
