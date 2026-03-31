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

router.use(protect);

router.route("/").get(getAllActivities).post(createActivity);

router
  .route("/:id")
  .get(getActivity)
  .patch(updateActivity)
  .delete(restrictedTo("owner", "admin"), deleteActivity);

module.exports = router;
