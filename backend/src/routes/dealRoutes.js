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
} = require("../controllers/dealController");

const { protect, restrictedTo } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  createDealSchema,
  updateDealSchema,
  changeDealStageSchema,
  assignDealSchema,
} = require("../validators/dealValidator");

// Protect all routes
router.use(protect);



router
  .route("/")
  .get(getAllDeals)
  .post(validate(createDealSchema), createDeal);

router.patch("/:id/stage", validate(changeDealStageSchema), changeDealStage);
router.patch(
  "/:id/assign",
  restrictedTo("owner", "admin"),
  validate(assignDealSchema),
  assignDeal,
);

router
  .route("/:id")
  .get(getDeal)
  .patch(validate(updateDealSchema), updateDeal)
  .delete(restrictedTo("owner", "admin"), deleteDeal);

module.exports = router;
