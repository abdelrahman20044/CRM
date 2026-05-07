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
const validate = require("../middlewares/validate");
const {
  createTaskSchema,
  updateTaskSchema,
  changeTaskStatusSchema,
  assignTaskSchema,
} = require("../validators/taskValidator");

router.use(protect);

router
  .route("/")
  .get(getAllTasks)
  .post(validate(createTaskSchema), createTask);

router.patch("/:id/status", validate(changeTaskStatusSchema), changeTaskStatus);

router.patch(
  "/:id/assign",
  restrictedTo("owner", "admin", "manager"),
  validate(assignTaskSchema),
  assignTask,
);
router
  .route("/:id")
  .get(getTask)
  .patch(validate(updateTaskSchema), updateTask)
  .delete(restrictedTo("owner", "admin"), deleteTask);

module.exports = router;
