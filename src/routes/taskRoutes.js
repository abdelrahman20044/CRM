const express = require("express");

const router = express.Router();
const {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  changeTaskStatus,
  assignTask,
} = require("../controllers/taskController");
const { protect, restrictedTo } = require("../middlewares/auth");

router.use(protect);

router.route("/").get(getAllTasks).post(createTask);

router.patch("/:id/status", changeTaskStatus);

router.patch(
  "/:id/assign",
  restrictedTo("owner", "admin", "manager"),
  assignTask,
);
router
  .route("/:id")
  .get(getTask)
  .patch(updateTask)
  .delete(restrictedTo("owner", "admin"), deleteTask);

module.exports = router;
