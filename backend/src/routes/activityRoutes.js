const express = require("express");

const router = express.Router();
const {
  getAllActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
} = require("../controllers/activityController");
const { protect, restrictedTo } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  createActivitySchema,
  updateActivitySchema,
} = require("../validators/activityValidator");

router.use(protect);

router
  .route("/")
  .get(getAllActivities)
  .post(validate(createActivitySchema), createActivity);

router
  .route("/:id")
  .get(getActivity)
  .patch(validate(updateActivitySchema), updateActivity)
  .delete(restrictedTo("owner", "admin"), deleteActivity);

module.exports = router;
