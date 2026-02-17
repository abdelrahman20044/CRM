const express = require("express");
const router = express.Router();
const {
  getAllDeals,
  createDeal,
  getDeal,
  updateDeal,
  deleteDeal,
  changeDealStage,
  assignDeal,
  //   getDealStats,
  //   getPipeline,
} = require("../controllers/dealController");

const { protect, restrictedTo } = require("../middlewares/auth");

// Protect all routes
router.use(protect);

// Stats & Pipeline routes
// router.get("/stats", getDealStats);
// router.get("/pipeline", getPipeline);

router.route("/").get(getAllDeals).post(createDeal);

router.patch("/:id/stage", changeDealStage);
router.patch("/:id/assign", restrictedTo("owner", "admin"), assignDeal);

router
  .route("/:id")
  .get(getDeal)
  .patch(updateDeal)
  .delete(restrictedTo("owner", "admin"), deleteDeal);

module.exports = router;
